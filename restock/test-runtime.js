// Simple runtime test
console.log('Testing domain service access...');

try {
  // Try to import the domain service
  const domain = require('./app/domain/index.ts');
  console.log('Domain import successful');
  console.log('Available exports:', Object.keys(domain));
  
  if (domain.RestockSessionDomainService) {
    console.log('RestockSessionDomainService found');
    console.log('Methods:', Object.getOwnPropertyNames(domain.RestockSessionDomainService));
    
    if (typeof domain.RestockSessionDomainService.groupSessionsByStatus === 'function') {
      console.log('groupSessionsByStatus is a function');
    } else {
      console.log('groupSessionsByStatus is NOT a function:', typeof domain.RestockSessionDomainService.groupSessionsByStatus);
    }
  } else {
    console.log('RestockSessionDomainService NOT found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
