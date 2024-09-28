import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText } from "lucide-react";
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfToText from 'react-pdftotext';
const apikey = process.env.REACT_APP_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apikey);

const Main = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [introData, setIntroData] = useState(null);
  const [mainData, setMainData] = useState(null);
  const [conclusionData, setConclusionData] = useState(null);
  const [overallScore, setOverallScore] = useState(null);
  const [fullResponseText, setFullResponseText] = useState(''); 
  const [initialResponseText, setInitialResponseText] = useState(""); 
  const navigate = useNavigate()
  const location  =useLocation()
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file to upload.');
      return;
    }
  
    setLoading(true);
  
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('api call happening');
  
      const text = await pdfToText(pdfFile);
      console.log('Extracted text:', text);
      
      const prompt = `
        Analyze the following PDF content: ${text}. 
        Explain how the plagiarism of the text is like${text} 
        For each section (introduction, main content, conclusion), identify any plagiarism.
        Give only the plagiarism data.        Give only the plagiarism data in number format like percentage wise for each.

        Provide the plagiarism results for each section as follows:
        - Introduction plagiarism: ***introData***
        - Main content plagiarism: ***mainData***
        - Conclusion plagiarism: ***conclusionData***
        - Overall plagiarism score: ***overallScore**
        
        give approximate percentages nothing else is needed to store in arr1 arr2 arr3 arr4

        initially explain about the plagiarism of the content and then in the final just show approximate percentage arr1, arr2, arr3, arr4 and the percentage of plagiarism in each content
                initially explain about the plagiarism of the content and then in the final just show approximate percentage  arr1, arr2, arr3, arr4 and the percentage of plagiarism in each content
        initially explain about the plagiarism of the content and then in the final just show  approximate percentage arr1, arr2, arr3, arr4 and the percentage of plagiarism in each content


        store the intro content plagiarism percentage in this show like arr1:[introplag]
        store the main content content plagiarism percentage in this arr2: [mainplag]
        store the conclusion content plagiarism percentage in this arr3: [conclusionplag]
        store in the overall plagiarism content plagiarism percentage in this arr4: [overallplag]

        store the intro content plagiarism percentage in this show like arr1:[introplag]
        store the main content plagiarism percentage in this arr2: [mainplag]
        store the conclusion content plagiarism percentage in this arr3: [conclusionplag]
        store in the overall plagiarism score content plagiarism percentage in this arr4: [overallplag]

        store the intro content plagiarism percentage in this show like arr1:[introplag]
        store the main content plagiarism percentage in this arr2: [mainplag]
        store the conclusion content plagiarism percentage in this arr3: [conclusionplag]
        store in the overall content plagiarism percentage in this arr4: [overallplag]

      `;
  
      const data = await model.generateContent(prompt);
      console.log('data', data);
  
      const responseText = data.response.candidates[0].content.parts[0].text;
      setFullResponseText(responseText); 
      const responseLines = responseText.split('\n');
      const initialLines = responseLines.slice(0, 6).join('\n'); 
      const sanitizedInitialLines = initialLines.replace(/[^\w\s.,!?]*/g, '');

      setInitialResponseText(sanitizedInitialLines);
      console.log('data text1', responseText);


      console.log('data text1', responseText);

    const arr1Match = responseText.match(/arr1:\s*\[(\d+)\]/);
    const arr2Match = responseText.match(/arr2:\s*\[(\d+)\]/);
    const arr3Match = responseText.match(/arr3:\s*\[(\d+)\]/);
    const arr4Match = responseText.match(/arr4:\s*\[(\d+)\]/);

    setIntroData(arr1Match ? parseFloat(arr1Match[1]):'No data found');
    setMainData(arr2Match ? parseFloat(arr2Match[1]):'No data found');
    setConclusionData(arr3Match ? parseFloat(arr3Match[1]):'No data found');
    setOverallScore(arr4Match ? parseFloat(arr4Match[1]):'No score available');
    
    console.log('intro', introData)
    console.log('main content', mainData)
  
    } catch (error) {
      console.error('Error generating plagiarism analysis:', error);
    } finally {
      setLoading(false);
    }
  };
const handleDownload = () => {
  const content = `
    Plagiarism Analysis Result:
    
    Introduction Data Plagiarism: ${introData}
    Main Data Plagiarism: ${mainData}
    Conclusion Data Plagiarism: ${conclusionData}
    Overall Score: ${overallScore}
    
    Additional Notes: ${initialResponseText}
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plagiarism_analysis.txt'; 
  document.body.appendChild(link);

  link.click();
  
  document.body.removeChild(link);
};

  

return (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <header style={{ padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', background: '#f8f8f8', borderBottom: '1px solid #ddd' }}>
      <Link style={{ display: 'flex', alignItems: 'center' }} to="/">
        <FileText style={{ height: '24px', width: '24px' }} />
        <span style={{ marginLeft: '8px', fontSize: '20px', fontWeight: 'bold' }}>PlagiarismAI</span>
      </Link>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
        <Link style={{ fontSize: '14px', fontWeight: '500', textDecoration: 'none' }} to="/features">Features</Link>
        <Link style={{ fontSize: '14px', fontWeight: '500', textDecoration: 'none' }} to="/pricing">Pricing</Link>
        <Link style={{ fontSize: '14px', fontWeight: '500', textDecoration: 'none' }} to="/about">About</Link>
        <Link style={{ fontSize: '14px', fontWeight: '500', textDecoration: 'none' }} to="/contact">Contact</Link>
      </nav>
    </header>

    <main style={{ flex: '1', padding: '40px 20px', background: 'linear-gradient(to bottom, white, #f0f0f0)' }}>
      {location.pathname === '/' && (
        <section style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Experience Lightning AI-Powered Plagiarism Detection 🚀</h1>
          <p style={{ color: '#666', margin: '20px 0' }}>
            Ensure academic integrity with our cutting-edge AI technology. Our service is quick, efficient, and provides detailed analysis.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>⚡ Lightning Fast</h2>
              <p style={{ color: '#666' }}>Get your results in real-time, saving you valuable time.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>📊 Detailed Analysis</h2>
              <p style={{ color: '#666' }}>In-depth reports that highlight plagiarism across your document.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>🖥️ User-Friendly</h2>
              <p style={{ color: '#666' }}>Simple interface for quick uploads and easy navigation.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload')}
            style={{
              padding: '10px 20px',backgroundColor: '#007bff',color: 'white',border: 'none',borderRadius: '4px',cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        </section>
      )}

      {location.pathname === '/upload' && (
        <section style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Upload Your Document</h1>
          <div style={{ margin: '20px 0' }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ marginRight: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Uploading...' : 'Upload Your Document'}
            </button>
          </div>
          {introData && (
            <div style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Plagiarism Analysis Result:</h2>
              <p><strong>Introduction Data Plagiarism:</strong> {introData}</p>
              <p><strong>Main Data Plagiarism:</strong> {mainData}</p>
              <p><strong>Conclusion Data Plagiarism:</strong> {conclusionData}</p>
              <p><strong>Overall Score:</strong> {overallScore}</p>
              <p>{initialResponseText}</p>
              <button onClick={handleDownload} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                Download Report
              </button>
            </div>
          )}
        </section>
      )}
    </main>

    <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #ddd' }}>
      <p style={{ fontSize: '12px', color: '#999' }}>© 2024 PlagiarismAI done by Srikanthan. All rights reserved.</p>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Link style={{ fontSize: '12px', textDecoration: 'none' }} to="/terms">Terms of Service</Link>
        <Link style={{ fontSize: '12px', textDecoration: 'none' }} to="/privacy">Privacy</Link>
      </nav>
    </footer>
  </div>
);

  
};

export default Main;
