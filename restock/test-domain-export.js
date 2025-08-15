// Test script to check domain service exports
const { RestockSessionDomainService } = require('./app/domain/services/RestockSessionDomainService.ts');

console.log('RestockSessionDomainService:', RestockSessionDomainService);
console.log('Available methods:', Object.getOwnPropertyNames(RestockSessionDomainService));
console.log('groupSessionsByStatus:', RestockSessionDomainService.groupSessionsByStatus);
console.log('typeof groupSessionsByStatus:', typeof RestockSessionDomainService.groupSessionsByStatus);
