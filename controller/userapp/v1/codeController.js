const axios = require("axios");



const compileCode = async (req, res) => {
    const { code, language, input } = req.body;
  
 
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
  console.log(process.env.RAPIDAPI_HOST,process.env.RAPIDAPI_KEY)
     
      const response = await axios.post(`https://${process.env.RAPIDAPI_HOST}/submissions`, payload, {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Host":process.env.RAPIDAPI_HOST,
          "X-RapidAPI-Key":process.env.RAPIDAPI_KEY,
        },
      });
  
   
      const { token } = response.data;
  
  
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
  
     

      return res.status(200).json({
        output: result.stdout,
        error: result.stderr,
        compileOutput: result.compile_output,
        status: result.status.description,
      });
    } catch (error) {
      console.error("Error compiling code:", error.message);
      res.status(500).json({ error: "Failed to compile the code." });
    }
};




module.exports = { compileCode };
