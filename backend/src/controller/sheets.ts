import axios from "axios"
import express,{ Request,Response } from "express";


export const metaData = async (req:express.Request,res:express.Response) => {
  try {
    const { spreadsheetId } = req.body

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    const metadataResponse = await axios({
      method : "GET",
      url : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
    }
    );

    res.status(200).json({success:true,data:metadataResponse.data})
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    res.status(500).json({message : "Internal Server Error"})
  }
};

export const sheetData = async (req:express.Request,res:express.Response) => {
  try {
    const { spreadsheetId } = req.body
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    const response = await axios({
      method : "GET",
      url : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`,
    });
    
    res.status(200).json({success:true,data:response.data})
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    res.status(500).json({message : "Internal Server Error"})
  }
}