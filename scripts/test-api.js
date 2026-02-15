// Test quiz submission API directly
const testQuizSubmission = async () => {
    try {
        console.log('🧪 Testing Quiz Submission API\n');

        // First, get a quiz ID from database
        const quizId = 'c6f030ff-a6e7-47f2-b44d-e16b696fae9a'; // Replace with actual quiz ID
        const userId = 'user_2rVx4J5qQ2XJlQ2XJlQ2XJlQ2'; // Replace with actual user ID

        const testAnswers = {
            '0': 'A',
            '1': 'B',
            '2': 'C'
        };

        console.log('Quiz ID:', quizId);
        console.log('Test answers:', testAnswers);
        console.log('\nSending POST request to /api/quizzes/<id>/attempt...\n');

        const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}/attempt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'clerk-session=...' // Would need actual session
            },
            body: JSON.stringify({ answers: testAnswers })
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get('content-type');
        console.log('\nContent-Type:', contentType);

        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            console.log('\n✅ JSON Response:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            data = await response.text();
            console.log('\n⚠️  Text Response:');
            console.log(data);
        }

    } catch (error) {
        console.error('\n❌ Error during test:');
        console.error(error);
    }
};

testQuizSubmission();
