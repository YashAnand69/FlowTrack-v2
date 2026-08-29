import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import type { Profile, Client, Invoice, InvoiceItem, InvoiceWithDetails, InvoiceStatus } from '../supabase/database.types'

export class FirestoreService {
  private getUserRef(userId: string) {
    return doc(db, 'users', userId)
  }

  // --------------------------------------------------------------------------
  // PROFILES
  // --------------------------------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isFirebaseConfigured || !userId) return null
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'settings')
      const snap = await getDoc(profileRef)
      if (snap.exists()) {
        return snap.data() as Profile
      }
      return null
    } catch (e) {
      console.error('Error fetching Firestore profile:', e)
      return null
    }
  }

  async updateProfile(data: Partial<Profile>, userId: string): Promise<Profile> {
    if (!isFirebaseConfigured || !userId) throw new Error('Firebase is not configured')
    const profileRef = doc(db, 'users', userId, 'profile', 'settings')
    const current = await this.getProfile(userId)

    const updatedProfile: Profile = {
      id: userId,
      business_name: data.business_name ?? current?.business_name ?? 'Rivera Design Studio',
      business_email: data.business_email ?? current?.business_email ?? '',
      logo_url: data.logo_url ?? current?.logo_url ?? null,
      currency: data.currency ?? current?.currency ?? 'USD',
      tax_rate: data.tax_rate ?? current?.tax_rate ?? 0,
      payment_terms: data.payment_terms ?? current?.payment_terms ?? 'Payment due within 14 days of invoice date.',
      created_at: current?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await setDoc(profileRef, updatedProfile, { merge: true })
    return updatedProfile
  }

  // --------------------------------------------------------------------------
  // CLIENTS
  // --------------------------------------------------------------------------
  async getClients(userId: string): Promise<Client[]> {
    if (!isFirebaseConfigured || !userId) return []
    try {
      const clientsRef = collection(db, 'users', userId, 'clients')
      const q = query(clientsRef, orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Client[]
    } catch (e) {
      console.error('Error fetching Firestore clients:', e)
      return []
    }
  }

  async createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
    const clientsRef = collection(db, 'users', data.user_id, 'clients')
    const now = new Date().toISOString()

    const docRef = await addDoc(clientsRef, {
      ...data,
      created_at: now,
      updated_at: now,
    })

    return {
      id: docRef.id,
      ...data,
      created_at: now,
      updated_at: now,
    }
  }

  async updateClient(id: string, data: Partial<Client>, userId: string): Promise<Client> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
    const clientRef = doc(db, 'users', userId, 'clients', id)
    const now = new Date().toISOString()

    await updateDoc(clientRef, {
      ...data,
      updated_at: now,
    })

    const snap = await getDoc(clientRef)
    return { id: snap.id, ...snap.data() } as Client
  }

  async deleteClient(id: string, userId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
    const clientRef = doc(db, 'users', userId, 'clients', id)
    await deleteDoc(clientRef)
  }

  // --------------------------------------------------------------------------
  // INVOICES & LINE ITEMS
  // --------------------------------------------------------------------------
  async getInvoices(userId: string): Promise<InvoiceWithDetails[]> {
    if (!isFirebaseConfigured || !userId) return []
    try {
      const invoicesRef = collection(db, 'users', userId, 'invoices')
      const q = query(invoicesRef, orderBy('created_at', 'desc'))
      const snap = await getDocs(q)

      const clients = await this.getClients(userId)
      const clientMap = new Map(clients.map((c) => [c.id, c]))

      const results: InvoiceWithDetails[] = []

      for (const d of snap.docs) {
        const invData = d.data() as Invoice
        const itemsRef = collection(db, 'users', userId, 'invoices', d.id, 'items')
        const itemsSnap = await getDocs(itemsRef)
        const items = itemsSnap.docs.map((it) => ({
          id: it.id,
          ...it.data(),
        })) as InvoiceItem[]

        const total_amount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)

        results.push({
          ...invData,
          id: d.id,
          client: clientMap.get(invData.client_id) || undefined,
          items,
          total_amount,
        })
      }

      return results
    } catch (e) {
      console.error('Error fetching Firestore invoices:', e)
      return []
    }
  }

  async createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
    itemsData: Array<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>>
  ): Promise<InvoiceWithDetails> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
    const userId = invoiceData.user_id
    const invoicesRef = collection(db, 'users', userId, 'invoices')
    const now = new Date().toISOString()

    const invDocRef = await addDoc(invoicesRef, {
      ...invoiceData,
      created_at: now,
      updated_at: now,
    })

    const items: InvoiceItem[] = []
    const batch = writeBatch(db)

    for (const item of itemsData) {
      const itemRef = doc(collection(db, 'users', userId, 'invoices', invDocRef.id, 'items'))
      const itemRecord: InvoiceItem = {
        id: itemRef.id,
        invoice_id: invDocRef.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount || item.quantity * item.rate,
        created_at: now,
      }
      batch.set(itemRef, itemRecord)
      items.push(itemRecord)
    }

    await batch.commit()

    const clients = await this.getClients(userId)
    const client = clients.find((c) => c.id === invoiceData.client_id)
    const total_amount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)

    return {
      id: invDocRef.id,
      ...invoiceData,
      client,
      items,
      total_amount,
      created_at: now,
      updated_at: now,
    }
  }

  async updateInvoice(
    id: string,
    invoiceData: Partial<Invoice>,
    itemsData?: Array<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>>,
    userId?: string
  ): Promise<InvoiceWithDetails> {
    if (!isFirebaseConfigured || !userId) throw new Error('Firebase is not configured')
    const invRef = doc(db, 'users', userId, 'invoices', id)
    const now = new Date().toISOString()

    await updateDoc(invRef, {
      ...invoiceData,
      updated_at: now,
    })

    if (itemsData) {
      // Replace items in subcollection
      const itemsRef = collection(db, 'users', userId, 'invoices', id, 'items')
      const oldItemsSnap = await getDocs(itemsRef)
      const batch = writeBatch(db)

      oldItemsSnap.docs.forEach((d) => batch.delete(d.ref))

      for (const item of itemsData) {
        const itemRef = doc(collection(db, 'users', userId, 'invoices', id, 'items'))
        batch.set(itemRef, {
          id: itemRef.id,
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount || item.quantity * item.rate,
          created_at: now,
        })
      }

      await batch.commit()
    }

    const allInvoices = await this.getInvoices(userId)
    const updated = allInvoices.find((i) => i.id === id)
    if (!updated) throw new Error('Invoice not found after update')
    return updated
  }

  async deleteInvoice(id: string, userId: string): Promise<void> {
    if (!isFirebaseConfigured || !userId) throw new Error('Firebase is not configured')
    const invRef = doc(db, 'users', userId, 'invoices', id)
    await deleteDoc(invRef)
  }

  async markInvoiceAsPaid(id: string, userId: string): Promise<InvoiceWithDetails> {
    return this.updateInvoice(id, { status: 'paid' }, undefined, userId)
  }
}

export const firestoreService = new FirestoreService()
