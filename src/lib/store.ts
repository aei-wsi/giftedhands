'use client';

import { Client, Appointment, PostVisitNote, ACC, ICPSSubmission } from '@/types';
import { clients as mockClients, appointments as mockAppointments, postVisitNotes as mockNotes } from './mockData';

const KEYS = {
  CLIENTS: 'ghe_clients',
  APPOINTMENTS: 'ghe_appointments',
  NOTES: 'ghe_notes',
  ICPS: 'ghe_icps',
  SSEP_NAME: 'ghe_ssep_name',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getClients(): Client[] {
  return getItem(KEYS.CLIENTS, mockClients);
}

export function saveClients(clients: Client[]): void {
  setItem(KEYS.CLIENTS, clients);
}

export function getAppointments(): Appointment[] {
  return getItem(KEYS.APPOINTMENTS, mockAppointments);
}

export function saveAppointments(appointments: Appointment[]): void {
  setItem(KEYS.APPOINTMENTS, appointments);
}

export function getPostVisitNotes(): PostVisitNote[] {
  return getItem(KEYS.NOTES, mockNotes);
}

export function savePostVisitNotes(notes: PostVisitNote[]): void {
  setItem(KEYS.NOTES, notes);
}

export function saveICPS(submission: ICPSSubmission): void {
  const existing = getItem<ICPSSubmission[]>(KEYS.ICPS, []);
  setItem(KEYS.ICPS, [...existing, submission]);
}

export function getSSEPName(): string {
  return getItem(KEYS.SSEP_NAME, 'Jordan M.');
}

export function saveSSEPName(name: string): void {
  setItem(KEYS.SSEP_NAME, name);
}

export function updateAppointmentACC(appointmentId: string, acc: ACC): void {
  const appointments = getAppointments();
  const updated = appointments.map(a =>
    a.id === appointmentId ? { ...a, acc, status: 'Arrived' as const } : a
  );
  saveAppointments(updated);
}

export function updateAppointmentStatus(appointmentId: string, status: Appointment['status']): void {
  const appointments = getAppointments();
  const updated = appointments.map(a =>
    a.id === appointmentId ? { ...a, status } : a
  );
  saveAppointments(updated);
}

export function addPostVisitNote(note: PostVisitNote): void {
  const notes = getPostVisitNotes();
  const existing = notes.findIndex(n => n.appointmentId === note.appointmentId);
  if (existing >= 0) {
    notes[existing] = note;
    savePostVisitNotes(notes);
  } else {
    savePostVisitNotes([...notes, note]);
  }
}
