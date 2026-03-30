export interface Client {
  id: string;
  name: string;
  phone: string;
  holding: string;
  cardNumber: string;
  billingStatus: 'paid' | 'due';
  billingMonth: string;
}

export interface Employee {
  id: string;
  phone: string;
  password: string;
  name: string;
}

let clients: Client[] = [
  { id: '1', name: 'Rafiq Islam', phone: '01711111111', holding: 'H-101', cardNumber: 'RS-0001', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '2', name: 'Kamal Hossain', phone: '01722222222', holding: 'H-102', cardNumber: 'RS-0002', billingStatus: 'due', billingMonth: '2026-03' },
  { id: '3', name: 'Nasima Begum', phone: '01733333333', holding: 'H-103', cardNumber: 'RS-0003', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '4', name: 'Shahidul Alam', phone: '01744444444', holding: 'H-104', cardNumber: 'RS-0004', billingStatus: 'due', billingMonth: '2026-03' },
  { id: '5', name: 'Fatema Khatun', phone: '01755555555', holding: 'H-105', cardNumber: 'RS-0005', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '6', name: 'Mizanur Rahman', phone: '01766666666', holding: 'H-106', cardNumber: 'RS-0006', billingStatus: 'due', billingMonth: '2026-03' },
  { id: '7', name: 'Ayesha Siddiqua', phone: '01777777777', holding: 'H-107', cardNumber: 'RS-0007', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '8', name: 'Jamal Uddin', phone: '01788888888', holding: 'H-108', cardNumber: 'RS-0008', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '9', name: 'Rina Akter', phone: '01799999999', holding: 'H-109', cardNumber: 'RS-0009', billingStatus: 'due', billingMonth: '2026-03' },
  { id: '10', name: 'Habibur Rahman', phone: '01700000010', holding: 'H-110', cardNumber: 'RS-0010', billingStatus: 'paid', billingMonth: '2026-03' },
  { id: '11', name: 'Sumon Das', phone: '01700000011', holding: 'H-111', cardNumber: 'RS-0011', billingStatus: 'due', billingMonth: '2026-03' },
  { id: '12', name: 'Taslima Nasrin', phone: '01700000012', holding: 'H-112', cardNumber: 'RS-0012', billingStatus: 'paid', billingMonth: '2026-03' },
];

let employees: Employee[] = [
  { id: '2', phone: '01700000002', password: 'emp123', name: 'Employee User' },
  { id: '3', phone: '01700000003', password: 'emp456', name: 'Sakib Ahmed' },
];

// Client APIs
export const getClients = () => [...clients];
export const addClient = (c: Omit<Client, 'id'>) => {
  const newClient = { ...c, id: String(Date.now()) };
  clients = [...clients, newClient];
  return newClient;
};
export const updateClient = (id: string, data: Partial<Client>) => {
  clients = clients.map(c => c.id === id ? { ...c, ...data } : c);
  return clients.find(c => c.id === id)!;
};
export const deleteClient = (id: string) => {
  clients = clients.filter(c => c.id !== id);
};

// Employee APIs
export const getEmployees = () => [...employees];
export const addEmployee = (e: Omit<Employee, 'id'>) => {
  const newEmp = { ...e, id: String(Date.now()) };
  employees = [...employees, newEmp];
  return newEmp;
};
export const updateEmployee = (id: string, data: Partial<Employee>) => {
  employees = employees.map(e => e.id === id ? { ...e, ...data } : e);
  return employees.find(e => e.id === id)!;
};
export const deleteEmployee = (id: string) => {
  employees = employees.filter(e => e.id !== id);
};
