
const quiz = require("../../../model/quiz");
const user = require("../../../model/user");
const dbService = require("../../../utils/dbServices");


const evaluateQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

   
    const foundQuiz = await dbService.findOne(quiz, { id: quizId });
    if (!foundQuiz) {
      return res.recordNotFound({ message: 'Quiz not found.' });
    }

  
    const foundUser = await dbService.findOne(user, { id: userId });
    if (!foundUser) {
      return res.recordNotFound({ message: 'User not found.' });
    }


    foundUser.credit = foundUser.credit || 0;


    let totalCreditEarned = 0;
    foundQuiz?.questions?.forEach((question) => {
      const userAnswer = answers.find((ans) => ans.questionId === question._id.toString());
      if (userAnswer && userAnswer.selectedOption === question.correctOption) {
        totalCreditEarned += question.credit;
      }
    });

   

const dataToUpdate = {
      $inc: {
        credit: totalCreditEarned,
      },
    };
    
    const query = { _id: userId};
      let updatedUser = await dbService.updateOne(user, query, dataToUpdate);
 

    return res.success({
      message: 'Quiz evaluated successfully.',
      data: {
        creditEarned: totalCreditEarned,
        totalCredit: updatedUser?.credit,
      },
    });
  } catch (error) {
    console.error('Error evaluating quiz:', error);
    return res.internalServerError({ message: 'An error occurred while evaluating the quiz.' });
  }
};


  module.exports = {
   evaluateQuiz

}