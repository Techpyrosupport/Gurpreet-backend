



const quiz = require("../../../model/quiz");
const user = require("../../../model/user");
const dbService = require("../../../utils/dbServices");


const evaluateQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body; 
    const userId = req.user.id;

  
    const quiz = await dbService.findOne(quiz,quizId);
    if (!foundquiz){
      return res.recordNotFound({message: 'Quiz not found.' });
    }

    const user = await dbService.findOne(user,userId);
    if (!user) {
      return res.recordNotFound( {message: 'User not found.' });
    }

    let totalCreditEarned = 0;

  
    quiz.questions.forEach((question) => {
      const userAnswer = answers.find((ans) => ans.questionId === question._id);
      if (userAnswer && userAnswer.selectedOption === question.correctOption) {
        totalCreditEarned += question.credit; 
      }
    });

 
    user.credit += totalCreditEarned;
    await user.save();

  
    return res.success({
      message: 'Quiz evaluated successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.internalServerError({ message:error.message });
  }
};
  module.exports = {
   evaluateQuiz

}