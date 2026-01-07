import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Logo } from '../../components/Components';

export const CandidateAgreement: React.FC = () => {
  const { candidates, markAgreementSent, markAgreementAccepted, isCloudEnabled } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const candidate = candidates.find(c => c.id === id);

  if (!candidate) {
    return <div className="p-8 text-center text-gray-500">Candidate not found</div>;
  }

  const handleEmail = () => {
    if (!candidate.email) {
        alert("No email address found for this candidate.");
        return;
    }
    
    // Generate the public link
    const baseUrl = window.location.href.split('#')[0]; // Get base domain
    const acceptanceLink = `${baseUrl}#/portal/agreement/${candidate.id}`;

    const subject = encodeURIComponent(`Training Agreement - ${candidate.name} (${candidate.batchId})`);
    
    // Body with Link
    const bodyText = `Dear ${candidate.name},

Please review and accept your training agreement with SPR Techforge using the link below:

CLICK HERE TO ACCEPT AGREEMENT:
${acceptanceLink}

--------------------------------------------------
Alternatively, the text is provided below for your reference:

${candidate.agreementText}

Regards,
SPR Techforge Pvt Ltd`;

    const body = encodeURIComponent(bodyText);
    
    // Mark as sent in system
    markAgreementSent(candidate.id);

    window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`);
  };

  const handleManualAccept = () => {
      if (window.confirm("Confirm that the candidate has physically signed or accepted the agreement?")) {
          markAgreementAccepted(candidate.id);
      }
  };

  return (
    <div className="bg-white min-h-screen text-black p-8">
      {/* No-print controls */}
      <div className="print:hidden mb-8 space-y-4">
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg border border-gray-300">
            <Button variant="secondary" onClick={() => navigate(-1)} className="text-gray-800">Back</Button>
            
            <div className="flex gap-2">
                {!candidate.agreementAcceptedDate ? (
                    <>
                        <Button 
                            variant="secondary" 
                            onClick={handleEmail} 
                            className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                            Email Agreement & Link
                        </Button>
                        <Button variant="success" onClick={handleManualAccept}>
                            Mark as Accepted
                        </Button>
                    </>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accepted on {new Date(candidate.agreementAcceptedDate).toLocaleDateString()}
                    </div>
                )}
                <Button onClick={() => window.print()}>Print / Save PDF</Button>
            </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className={`p-3 rounded border ${candidate.agreementSentDate ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                 <span className="font-bold text-xs uppercase block">Status: Sent</span>
                 {candidate.agreementSentDate ? new Date(candidate.agreementSentDate).toLocaleString() : 'Not Sent yet'}
             </div>
             <div className={`p-3 rounded border ${candidate.agreementAcceptedDate ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                 <span className="font-bold text-xs uppercase block">Status: Accepted</span>
                 {candidate.agreementAcceptedDate ? new Date(candidate.agreementAcceptedDate).toLocaleString() : 'Pending'}
             </div>
             <div className={`p-3 rounded border ${candidate.agreementRejectedDate ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                 <span className="font-bold text-xs uppercase block">Status: Rejected</span>
                 {candidate.agreementRejectedDate ? (
                     <div>
                         <p className="text-xs">{new Date(candidate.agreementRejectedDate).toLocaleString()}</p>
                         <p className="text-[10px] italic mt-1">Reason: {candidate.agreementRejectionReason}</p>
                     </div>
                 ) : 'No Rejections'}
             </div>
        </div>

        {!isCloudEnabled && (
            <div className="bg-amber-50 text-amber-800 text-xs p-2 rounded border border-amber-200">
                <strong>Note:</strong> Online Acceptance Link only works when Cloud Sync is enabled. If offline, please use "Mark as Accepted" manually.
            </div>
        )}
      </div>

      {/* Printable Content */}
      <div className="max-w-3xl mx-auto print:w-full">
        <div className="flex items-center justify-between mb-8 border-b-2 border-indigo-600 pb-4">
           <div className="flex items-center gap-3">
               <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-lg">
                   <svg className="text-white w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
               </div>
               <div>
                   <h1 className="text-2xl font-bold text-indigo-900">SPR Techforge Pvt Ltd</h1>
                   <p className="text-sm text-gray-500">Excellence in Training & Placement</p>
               </div>
           </div>
           <div className="text-right text-sm text-gray-600">
             <p>Date: {new Date().toLocaleDateString()}</p>
             <p>Ref: {candidate.batchId}</p>
           </div>
        </div>

        <div className="mb-8">
           <h2 className="text-xl font-bold text-center uppercase underline mb-6">Candidature Training Agreement</h2>
           
           <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded border border-gray-200">
              <div>
                 <p className="text-xs text-gray-500 uppercase">Candidate Name</p>
                 <p className="font-bold text-lg">{candidate.name}</p>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase">Batch ID</p>
                 <p className="font-bold text-lg">{candidate.batchId}</p>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase">Contact</p>
                 <p>{candidate.phone}</p>
                 <p>{candidate.email}</p>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase">Address</p>
                 <p className="whitespace-pre-wrap">{candidate.address || 'N/A'}</p>
              </div>
           </div>

           <div className="prose max-w-none">
              <div className="whitespace-pre-wrap font-serif text-justify leading-relaxed text-gray-800">
                 {candidate.agreementText || "No agreement text provided."}
              </div>
           </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-10">
           <div className="border-t border-black pt-2 text-center">
             <p className="font-bold">SPR Techforge Representative</p>
             <p className="text-xs text-gray-500">(Authorized Signatory)</p>
           </div>
           <div className="border-t border-black pt-2 text-center relative">
             <p className="font-bold">{candidate.name}</p>
             <p className="text-xs text-gray-500">(Candidate Signature)</p>
             
             {candidate.agreementAcceptedDate && (
                 <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 border-2 border-emerald-600 text-emerald-600 px-4 py-1 font-bold rounded opacity-80 rotate-[-10deg]">
                     DIGITALLY ACCEPTED
                     <div className="text-[8px] text-center">{new Date(candidate.agreementAcceptedDate).toLocaleDateString()}</div>
                 </div>
             )}
             
             {candidate.agreementRejectedDate && (
                 <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 border-2 border-red-600 text-red-600 px-4 py-1 font-bold rounded opacity-80 rotate-[-10deg]">
                     REJECTED
                     <div className="text-[8px] text-center">{new Date(candidate.agreementRejectedDate).toLocaleDateString()}</div>
                 </div>
             )}
           </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400 print:fixed print:bottom-4 print:w-full">
           <p>SPR Techforge Pvt Ltd | Sri Godha Nilayam, 9th Phase Rd, KPHB phase 6, Kukatpally, Hyderabad | contact@sprtechforge.com</p>
        </div>
      </div>
    </div>
  );
};