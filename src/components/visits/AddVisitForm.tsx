import React, { useState } from "react";
import type { Visit } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface AddVisitFormProps {
  onAddVisit: (visit: Omit<Visit, 'id' | 'attachedDocuments'> & { attachedDocuments?: File[] }) => void;
  onCancel: () => void;
}

export function AddVisitForm({ onAddVisit, onCancel }: AddVisitFormProps) {
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [attachedDocuments, setAttachedDocuments] = useState<File[]>([]);
  const [reminderOption, setReminderOption] = useState("");
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [patientName, setPatientName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate || !doctorName) return;
    onAddVisit({
      date: appointmentDate,
      doctorName,
      notes,
      specialization,
      attachedDocuments,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Schedule New Visit</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details for the medical appointment</p>
      </div>

      {/* Patient Information Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          {/* <UserCircleIcon className="h-5 w-5 text-blue-600" /> */}
          <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                required
                placeholder="Enter patient name" 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              {/* <UserCircleIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
            <select
              value={appointmentType}
              onChange={e => setAppointmentType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Routine Checkup">Routine Checkup</option>
              <option value="Consultation">Consultation</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={appointmentDate} 
                onChange={e => setAppointmentDate(e.target.value)} 
                required 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              {/* <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
            <div className="relative">
              <input 
                type="time" 
                value={appointmentTime} 
                onChange={e => setAppointmentTime(e.target.value)} 
                required 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              {/* <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Information Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          {/* <BriefcaseMedicalIcon className="h-5 w-5 text-blue-600" /> */}
          <h3 className="text-lg font-medium text-gray-900">Doctor Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
            <input 
              type="text" 
              value={doctorName} 
              onChange={e => setDoctorName(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Dr. Smith" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input 
              type="text" 
              value={specialization} 
              onChange={e => setSpecialization(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Cardiology" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Main Hospital, Room 101" 
              />
              {/* <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select duration</option>
              <option value="15 min">15 minutes</option>
              <option value="30 min">30 minutes</option>
              <option value="45 min">45 minutes</option>
              <option value="1 hour">1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes & Documents Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          {/* <FileTextIcon className="h-5 w-5 text-blue-600" /> */}
          <h3 className="text-lg font-medium text-gray-900">Notes & Documents</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]" 
              placeholder="Enter any relevant notes about the visit..." 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Documents</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      multiple 
                      onChange={e => setAttachedDocuments(Array.from(e.target.files || []))}
                      className="sr-only" 
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, JPG up to 10MB</p>
              </div>
            </div>
            {attachedDocuments.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Attached Files:</h4>
                <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                  {attachedDocuments.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div className="flex w-0 flex-1 items-center">
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setAttachedDocuments(attachedDocuments.filter((_, i) => i !== idx))}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reminder Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          {/* <BellIcon className="h-5 w-5 text-blue-600" /> */}
          <h3 className="text-lg font-medium text-gray-900">Reminder Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
            <select
              value={reminderOption}
              onChange={e => setReminderOption(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No reminder</option>
              <option value="15 min">15 minutes before</option>
              <option value="30 min">30 minutes before</option>
              <option value="1 hour">1 hour before</option>
              <option value="1 day">1 day before</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="enable-notifications"
              name="enable-notifications"
              type="checkbox"
              checked={enableNotifications}
              onChange={e => setEnableNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enable-notifications" className="ml-2 block text-sm text-gray-700">
              Enable push notifications
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Schedule Visit
        </Button>
      </div>
    </form>
  );
}