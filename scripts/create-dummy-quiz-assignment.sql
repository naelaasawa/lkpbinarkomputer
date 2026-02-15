-- =====================================================
-- QUICK DUMMY QUIZ ASSIGNMENT CREATOR
-- =====================================================
-- This script helps you create a completed quiz assignment
-- so you can test the "show results immediately" feature
--
-- INSTRUCTIONS:
-- 1. Open your database tool (MySQL Workbench, phpMyAdmin, etc.)
-- 2. Run STEP 1 to find user and quiz IDs
-- 3. Copy the IDs and paste them into STEP 2
-- 4. Run STEP 2 to create the dummy assignment
-- 5. Test in your browser!
-- =====================================================

-- =====================================================
-- STEP 1: Find User and Quiz IDs
-- =====================================================
-- Run this query to see available users and quizzes

SELECT 
    'USER INFO' as type,
    u.id as id,
    u.email as info,
    u.firstName as extra
FROM User u
LIMIT 5

UNION ALL

SELECT 
    'QUIZ INFO' as type,
    q.id as id,
    q.title as info,
    CONCAT(COUNT(ques.id), ' questions') as extra
FROM Quiz q
LEFT JOIN Question ques ON q.id = ques.quizId
GROUP BY q.id, q.title
LIMIT 5;

-- =====================================================
-- STEP 2: Create Dummy Quiz Assignment
-- =====================================================
-- REPLACE THESE VALUES with actual IDs from STEP 1:

SET @user_id = 'PASTE_USER_ID_HERE';          -- Example: 'user_2k...'
SET @quiz_id = 'PASTE_QUIZ_ID_HERE';          -- Example: '550e8400-e29b-...'

-- Create the completed quiz assignment
INSERT INTO QuizAssignment (
    id,
    userId,
    quizId,
    status,
    score,
    answers,
    createdAt,
    completedAt
) VALUES (
    UUID(),
    @user_id,
    @quiz_id,
    'completed',
    75,  -- 75% score
    '{"0":"Answer A","1":"Answer B","2":"Answer C"}',  -- Dummy answers
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    status = 'completed',
    score = 75,
    answers = '{"0":"Answer A","1":"Answer B","2":"Answer C"}',
    completedAt = NOW();

-- =====================================================
-- STEP 3: Verify Creation
-- =====================================================

SELECT 
    qa.id,
    qa.status,
    qa.score,
    qa.completedAt,
    u.email as user_email,
    q.title as quiz_title
FROM QuizAssignment qa
JOIN User u ON qa.userId = u.id
JOIN Quiz q ON qa.quizId = q.id
WHERE qa.userId = @user_id AND qa.quizId = @quiz_id;

-- =====================================================
-- TESTING CHECKLIST
-- =====================================================
-- After running this script:
-- 
-- ✅ 1. Login with the user email from STEP 3
-- ✅ 2. Navigate to the quiz (from courses page)
-- ✅ 3. Should see RESULTS PAGE immediately (NOT questions)
-- ✅ 4. Should see badge "Quiz Completed - Your Previous Result"
-- ✅ 5. Should see "Review Answers" button
-- ✅ 6. Click "Review Answers" → see questions with indicators
-- ✅ 7. Click "Back to Results" → return to results page
--
-- 🐛 If it doesn't work, check browser console (F12)
--    Look for logs starting with [QuizPlayer]
-- =====================================================

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- If you want to delete the dummy assignment and test again:
-- DELETE FROM QuizAssignment WHERE userId = @user_id AND quizId = @quiz_id;
-- =====================================================
