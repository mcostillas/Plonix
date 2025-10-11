// Test script to verify goal creation API works
// Run this with: node docs/test-goal-api.js

const userId = 'a4dd8a83-0a6c-4ce6-b2ff-e20d860fcd80'; // Your user ID from logs

async function testGoalCreation() {
  try {
    console.log('Testing goal creation API...');
    
    const response = await fetch('http://localhost:3000/api/goals/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        title: 'Test Goal from API',
        targetAmount: 15000,
        description: 'Testing if goal creation works',
        aiGenerated: true
      })
    });

    const text = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response content type:', response.headers.get('content-type'));
    
    let result;
    try {
      result = JSON.parse(text);
      console.log('Response body:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Response is not JSON. First 500 chars:');
      console.log(text.substring(0, 500));
      return;
    }
    
    if (response.ok) {
      console.log('✅ SUCCESS! Goal was created!');
      console.log('Goal ID:', result.goal?.id);
    } else {
      console.log('❌ FAILED! Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testGoalCreation();
