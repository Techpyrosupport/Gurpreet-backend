const Code = require("../../../model/code"); 
const axios = require("axios");
const dbServices = require("../../../utils/dbServices");
const User = require("../../../model/user");
const codeResponse = require("../../../model/codeResponse");
const { isValidObjectId } = require("mongoose");

const compileCode = async (req, res) => {
  const { code, language, input, codeId } = req.body;
  const userId = req.user.id;

  if (!code || !language) {
    return res.status(400).json({ message: "Code and language are required." });
  }
  if (!codeId) {
    return res.status(400).json({ message: "CodeId is required." });
  }
  let query = {};
  query._id = codeId;
  let options = {};
  let existingCodeOnlywithId = await dbServices.findOne(Code,query, options);
  if (!existingCodeOnlywithId ){
    return res.recordNotFound();
  }
  try {
    const languageMap = {
      cpp: 54,
      python: 71,
      java: 62,
      javascript: 63,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const payload = {
      source_code: code,
      stdin: input || "",
      language_id: languageId,
    };

    // Request to compile the code
    const compileResponse = await axios.post(
      `https://${process.env.RAPIDAPI_HOST}/submissions`,
      payload,
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        },
      }
    );

    const { token } = compileResponse.data;
    let result;
    do {
      const resultResponse = await axios.get(
        `https://${process.env.RAPIDAPI_HOST}/submissions/${token}`,
        {
          headers: {
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          },
        }
      );
      result = resultResponse.data;
    } while (result.status.id === 1 || result.status.id === 2);

  
    const existingCodeResponse = await codeResponse.findOne({ codeId, userId });

    if (existingCodeResponse) {
      const { creditsEarned, lang, inputs } = existingCodeResponse;

    
      if (result.status.id === 3 && !creditsEarned) {
      
       


        const user = await dbServices.findOne(User, { id: userId });

        if (user) {
          const totalCredit = user.credit + existingCodeOnlywithId.credit;

      
      const userwithupdatedCredit=    await dbServices.updateOne(User, { id: userId }, { $set: { credit: totalCredit } });
      console.log(userwithupdatedCredit,"userWith updted credit")
          existingCodeResponse.creditsEarned = true;
          await existingCodeResponse.save();
        }
      }

      return res.status(200).json({
        message: result.status.id === 3 ? "Code compiled successfully" : "Code compilation failed.",
        output: result.stdout,
      });
    } else {
     
      const updatedInputs = {
        ...(existingCodeOnlywithId?.inputs ? Object.fromEntries(existingCodeOnlywithId.inputs) : {}),
        [language]: code,
      };

      const newCodeResponse = new codeResponse({
        codeId,
        lang: language,
        inputs: updatedInputs,
        userId,
        createdBy: userId,
        creditsEarned: result.status.id === 3, 
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newCodeResponse.save();
      return res.status(200).json({
        message: result.status.id === 3 ? "Code compiled successfully" : "Code compilation failed.",
        output: result.stdout,
      });
    }

  } catch (error) {
    console.error("Error compiling code:", error.message);
    return res.status(500).json({ message: error.message });
  }
};


/**
 * @description : find document of CodeResponse from table by CodeId and userid;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found CodeResponse. {status, message, data}
 */
const getCodeResponse = async (req, res) => {
  try {
    const codeId = req.params.id;
    const userId = req.user.id; 

 
    if (!isValidObjectId(codeId)) {
      return res.validationError({ message: 'Invalid CodeId.' });
    }


    const query = {
      codeId,
      userId,
    };

  
    const foundCodeResponse = await codeResponse.findOne(query).populate({
      path: 'codeId',
      select: 'inputs lang ',
    });
console.log(foundCodeResponse,"foundCodeResponse")
    if (!foundCodeResponse) {
    
    let foundCode = await dbServices.findOne(Code, { _id: codeId });

      if (!foundCode) {
        return res.recordNotFound({ message: 'Code not found.' });
      }

      foundData ={
        foundCode
      }
     
      return res.success({ data: foundCode });
    }else{
      return res.success({ data: foundCodeResponse });
    }

 

  } catch (error) {
    console.error('Error fetching Code response:', error);
    return res.internalServerError({ message: error.message });
  }
};


module.exports = { 
  compileCode,
  getCodeResponse,
 };
