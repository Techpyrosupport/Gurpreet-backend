const { OpenAI } = require("openai");
const { HistoryResponse } = require("../../../model/openAiChatHistory");
const validation = require('../../../utils/validateRequest');
const chatSchema = require("../../../utils/validation/chatValidation");
const dbService = require("../../../utils/dbServices");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  
});

const streamChatResponse = async (req, res) => {
  try {

    const userId = req.user.id;

    const prompt = req.body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const botResponse = response.choices[0].message.content;

   
    const sessionId = req.body.sessionId;  

    const chatHistory = new HistoryResponse({
      userId,
      sessionId,
      prompt,
      response:botResponse,
    });

    await chatHistory.save();  

  
    res.status(200).send({
      bot: botResponse,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to process the request' });
  }
};



/**
 * @description : find all documents of chat from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found ChatHistory(s). {status, message, data}
 */
const findAllChatHistory = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      chatSchema.findFilterKeys
      ,
      HistoryResponse.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    query._id = { $ne: req.user.id };
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
   
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(HistoryResponse, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
 
    let foundCourses = await dbService.paginate( HistoryResponse,query,options);
    if (!foundCourses || !foundCourses.data || !foundCourses.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundCourses });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};


module.exports ={
  findAllChatHistory,
  streamChatResponse

}