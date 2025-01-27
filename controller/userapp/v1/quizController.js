const { isValidObjectId } = require("mongoose");
const Quiz = require("../../../model/quiz");
const QuizResponse = require("../../../model/quizResponse");
const User = require("../../../model/user");
const dbService = require("../../../utils/dbServices");

/**
 * @description : Evaluate the quiz and update user's credit based on their answers.
 *                 If the user has already taken the quiz, do not allow re-attempt.
 * @param {Object} req : Request object containing the quizId and answers for evaluation.
 * @param {Object} res : Response object for sending the result back to the client, including the total credit earned and updated user credit.
 * @return {Object} : Response object containing status, message, and data (credit earned and total credit).
 */

const evaluateQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

    
    const foundQuiz = await dbService.findOne(Quiz, { _id: quizId });
    if (!foundQuiz) {
      return res.recordNotFound({ message: "Quiz not found." });
    }

   
    const foundUser = await dbService.findOne(User, { _id: userId });
    if (!foundUser) {
      return res.recordNotFound({ message: "User not found." });
    }

   
    const existingResponse = await dbService.findOne(QuizResponse, { quizId, userId });
    if (existingResponse) {
      return res.badRequest({ message: "You has already taken this quiz." });
    }

    
    let totalCreditEarned = 0;
    const evaluatedQuestions = foundQuiz.questions.map((question) => {
      const userAnswer = answers.find((ans) => ans.questionId === question._id.toString());
      if (userAnswer) {
        return {
          questionId: question._id,
          answer: userAnswer.selectedOption,
          isCorrect: userAnswer.selectedOption === question.correctOption,
        };
      }
      return { questionId: question._id, answer: null, isCorrect: false };
    });

   
    totalCreditEarned = evaluatedQuestions.reduce((sum, q) => {
      const originalQuestion = foundQuiz.questions.find((que) => que._id.toString() === q.questionId.toString());
      return q.isCorrect && originalQuestion ? sum + originalQuestion.credit : sum;
    }, 0);

   
    const newResponse = {
      quizId,
      userId,
      questions: evaluatedQuestions,
    };
    await dbService.create(QuizResponse, newResponse);

  
    await dbService.updateOne(User, { _id: userId }, { $inc: { credit: totalCreditEarned } });

    return res.success({
      message: "Quiz evaluated successfully.",
      data: {
        creditEarned: totalCreditEarned,
        totalCredit: foundUser.credit + totalCreditEarned,
      },
    });
  } catch (error) {
    console.error("Error evaluating quiz:", error);
    return res.internalServerError({ message: error.message });
  }
};



/**
 * @description : find document of QuizResponse from table by quizId and userid;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found QuizResponse. {status, message, data}
 */
const getQuizResponse = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id; 
console.log(userId)
 
    if (!isValidObjectId(quizId)) {
      return res.validationError({ message: 'Invalid quizId.' });
    }


    const query = {
      quizId,
      userId,
    };

  
    const foundQuizResponse = await QuizResponse.findOne(query).populate({
      path: 'quizId',
      select: 'title description questions',
    });

    if (!foundQuizResponse) {
    
      const foundQuiz = await dbService.findOne(Quiz, { _id: quizId });

      if (!foundQuiz) {
        return res.recordNotFound({ message: 'Quiz not found.' });
      }

     
      return res.success({ data: foundQuiz });
    }

 
    return res.success({ data: foundQuizResponse });
  } catch (error) {
    console.error('Error fetching quiz response:', error);
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  evaluateQuiz,
  getQuizResponse
};
