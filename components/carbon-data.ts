export const projects = [
  { id: 'CCNG-001', name: 'Ogun Forest Corridor', location: 'Ogun State, Nigeria', trees: '24,800', tonnes: '8,450', price: '12.50', status: 'Verified', accent: 'lime' },
  { id: 'CCNG-002', name: 'Cross River Restoration', location: 'Cross River, Nigeria', trees: '18,200', tonnes: '6,720', price: '13.20', status: 'Verified', accent: 'cyan' },
  { id: 'CCNG-003', name: 'Kwara Agroforestry', location: 'Kwara State, Nigeria', trees: '11,600', tonnes: '3,940', price: '11.90', status: 'Verified', accent: 'amber' },
]

export const navItems = ['Overview', 'Projects', 'Marketplace', 'Retirements', 'NGO Portal', 'Verifier Queue', 'Certificates']

export type Project = (typeof projects)[number]
