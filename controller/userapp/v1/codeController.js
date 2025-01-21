const Code = require("../../../model/code"); 
const axios = require("axios");
const dbServices = require("../../../utils/dbServices")

const compileCode = async (req, res) => {
  const { code, language, input,  codeId } = req.body;
const userId = req.user.id;
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
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

    // Make submission request
    const response = await axios.post(
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

    const { token } = response.data;

    // Poll for result
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

    // Check compilation status

      // Check if a document exists for the user and codeId
      let existingCode;
      if (codeId) {
        existingCode = await Code.findOne({ _id: codeId, userId: userId });
      }

      if (existingCode) {
        // Update existing document
        existingCode.lang = language;
        existingCode.inputs = new Map(Object.entries({ ...existingCode.inputs, input }));
        existingCode.updatedAt = new Date();
        await existingCode.save();
        return res.status(200).json({
          message: "Code updated successfully.",
          data: existingCode,
        });
      } else {
       
        // cradit add to user table if  sucessfully run
        if (result.status.description === "Accepted" && !result.stderr && !result.compile_output) {
         
const query = { id: userId };
const foundUser = await dbServices.findOne(Code, query);
if (foundUser) {
  const existingCodeCredit = existingCode ? existingCode.credit : 0;
  const totalCredit = foundUser.credit + existingCodeCredit;
  console.log(totalCredit, "totalCredit");
  const updateCredit = await dbServices.updateOne(Code, query, { credit: totalCredit });
}

    

        }
        const newCode = new Code({
          lang: language,
          inputs: new Map(Object.entries({ input })),
          isActive: true,
          addedBy: userId,
        });
        const createdCode = await newCode.save();
        return res.status(201).json({
          message: "Code compiled and saved successfully.",
          data: createdCode,
        });
      }
  } catch (error) {
    console.error("Error compiling code:", error.message);
    return res.status(500).json({ error: "Failed to compile the code." });
  }
};


const getCode = async(req,res)=>{
  try {
    const id = req.params.id;
    const userId = req.user.id;

  } catch (error) {
    return res.internalServerError({data:error.message})
  }
}

module.exports = { compileCode };
