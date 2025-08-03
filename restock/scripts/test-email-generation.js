#!/usr/bin/env node

console.log('🤖 Restock App - Email Generation Test');
console.log('=====================================\n');

// Simulate the email generation flow that happens in the app
async function testEmailGenerationFlow() {
  try {
    console.log('📋 Step 1: Loading session data...');
    
    // Simulate session data from a completed restock session
    const sessionData = {
      sessionId: 'session_123',
      storeName: 'Greenfields Grocery',
      groupedItems: {
        'supplier_1': {
          supplier: {
            name: 'Fresh Farms Co.',
            email: 'orders@freshfarms.com'
          },
          items: [
            {
              product: { name: 'Organic Bananas' },
              quantity: 4,
              notes: 'Need ripe ones'
            },
            {
              product: { name: 'Organic Eggs' },
              quantity: 6,
              notes: ''
            }
          ]
        },
        'supplier_2': {
          supplier: {
            name: 'Dairy Fresh',
            email: 'orders@dairyfresh.com'
          },
          items: [
            {
              product: { name: 'Greek Yogurt' },
              quantity: 3,
              notes: 'Plain flavor preferred'
            }
          ]
        }
      }
    };
    
    console.log(`✅ Session loaded with ${Object.keys(sessionData.groupedItems).length} suppliers`);
    
    console.log('\n🤖 Step 2: Initializing AI email generator...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ AI email generator initialized');
    
    console.log('\n📧 Step 3: Generating emails for each supplier...');
    
    const generatedEmails = [];
    
    for (const [supplierId, supplierData] of Object.entries(sessionData.groupedItems)) {
      const { supplier, items } = supplierData;
      
      console.log(`\n   📝 Generating email for ${supplier.name}...`);
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate email using our mock Phi-3 implementation
      const email = generateProfessionalEmail(supplier, items, sessionData.storeName);
      
      generatedEmails.push({
        id: `email_${supplierId}`,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        subject: email.subject,
        body: email.body,
        status: 'draft',
        products: items.map(item => `${item.quantity}x ${item.product.name}`),
        confidence: 0.95,
        generationTime: 1500
      });
      
      console.log(`   ✅ Email generated for ${supplier.name}`);
    }
    
    console.log('\n🎉 Step 4: Email generation completed!');
    console.log(`📊 Generated ${generatedEmails.length} emails successfully`);
    
    // Display the generated emails
    console.log('\n📧 Generated Emails:');
    console.log('===================');
    
    generatedEmails.forEach((email, index) => {
      console.log(`\n${index + 1}. ${email.supplierName} (${email.supplierEmail})`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Products: ${email.products.join(', ')}`);
      console.log(`   Confidence: ${(email.confidence * 100).toFixed(1)}%`);
      console.log(`   Generation time: ${email.generationTime}ms`);
      console.log('\n   Body preview:');
      console.log('   ' + email.body.substring(0, 150) + '...');
    });
    
    console.log('\n✅ Email generation test completed successfully!');
    console.log('\n💡 This demonstrates the complete flow that users will experience:');
    console.log('   1. Complete restock session');
    console.log('   2. Click "Generate Emails"');
    console.log('   3. AI generates professional emails for each supplier');
    console.log('   4. Review and edit emails if needed');
    console.log('   5. Send emails to suppliers');
    
  } catch (error) {
    console.error('❌ Error in email generation test:', error.message);
  }
}

function generateProfessionalEmail(supplier, items, storeName) {
  const productList = items.map(item => 
    `• ${item.quantity}x ${item.product.name}${item.notes ? ` (${item.notes})` : ''}`
  ).join('\n');
  
  const email = `Dear ${supplier.name} Team,

I hope this email finds you well. We are writing to place a restock order for our store, ${storeName}.

We require the following items:

${productList}

Please confirm the availability of these items and provide an estimated delivery timeline. If any items are currently out of stock, please let us know of suitable alternatives.

We appreciate your continued partnership and look forward to your response.

Best regards,
${storeName} Management Team

Contact: orders@${storeName.toLowerCase().replace(/\s+/g, '')}.com
Phone: (555) 123-4567`;

  return {
    subject: 'Restock Order Request',
    body: email
  };
}

// Run the test
testEmailGenerationFlow(); 