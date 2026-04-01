// Mock database for offline development
export const mockSocieties = [
  {
    id: 'soc-1',
    name: 'Sunrise Apartments',
    address: '123 Main St, Bangalore',
    society_code: 'SUNRISE-BLR-204',
    admin_id: 'admin-1'
  }
];

export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'fire',
    flat: '302',
    description: 'Smoke coming from kitchen, need help',
    status: 'active',
    society_id: 'soc-1',
    sent_by: 'user-1',
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    help_count: 3
  },
  {
    id: 'alert-2',
    type: 'medical',
    flat: '105',
    description: 'Heart palpitations, need someone to watch the kids',
    status: 'resolved',
    society_id: 'soc-1',
    sent_by: 'user-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    help_count: 5
  }
];

export const mockAnnouncements = [
  {
    id: 'ann-1',
    message: 'Water supply off tomorrow 10am - 2pm for maintenance.',
    society_id: 'soc-1',
    sent_by: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'ann-2',
    message: 'Happy Diwali! Please avoid bursting crackers near the parking lot.',
    society_id: 'soc-1',
    sent_by: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];
