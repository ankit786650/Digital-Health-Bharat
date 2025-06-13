import type { Facility } from './types';

export const mockFacilities: Facility[] = [
  {
    id: "1",
    name: "City General Hospital",
    type: "Government Hospital",
    address: "123 Main Street, Bangalore",
    lat: 12.9716,
    lng: 77.5946,
    phone: "+91 80 1234 5678",
    email: "info@cityhospital.com",
    website: "https://cityhospital.com",
    services: ["Emergency Care", "Surgery", "Pediatrics", "Gynecology"]
  },
  {
    id: "2",
    name: "Community Health Center",
    type: "PHC",
    address: "456 Health Avenue, Bangalore",
    lat: 12.9784,
    lng: 77.6408,
    phone: "+91 80 2345 6789",
    services: ["Primary Care", "Vaccination", "Maternal Health"]
  },
  {
    id: "3",
    name: "MedPlus Pharmacy",
    type: "Pharmacy",
    address: "789 Medicine Road, Bangalore",
    lat: 12.9850,
    lng: 77.6067,
    phone: "+91 80 3456 7890",
    services: ["Prescription Drugs", "Over-the-counter Medicines", "Health Supplies"]
  },
  {
    id: "4",
    name: "Dr. Sharma's Clinic",
    type: "Clinic",
    address: "321 Doctor Lane, Bangalore",
    lat: 12.9631,
    lng: 77.5932,
    phone: "+91 80 4567 8901",
    services: ["General Consultation", "Minor Procedures"]
  },
  {
    id: "5",
    name: "Jan Aushadhi Center",
    type: "Jan Aushadhi Kendra",
    address: "654 Medicine Street, Bangalore",
    lat: 12.9758,
    lng: 77.6011,
    phone: "+91 80 5678 9012",
    services: ["Generic Medicines", "Essential Drugs"]
  }
]; 