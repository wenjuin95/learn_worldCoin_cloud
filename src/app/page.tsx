"use client"; //is to indicate that the code will run in the client side

import { useState } from "react";
import { VerificationLevel, IDKitWidget, useIDKit } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import { verify } from "./actions/verify";

export default function Home() {
  const [proofResult, setProofResult] = useState<string | null>(null);
  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;

  if (!app_id) {
    throw new Error("app_id is not set in environment variables!");
  }
  if (!action) {
    throw new Error("action is not set in environment variables!");
  }

  const { setOpen } = useIDKit(); 

  // This function is called when a user has been successfully verified
  const onSuccess = (result: ISuccessResult) => {
    // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
    window.alert(
      "Successfully verified with World ID! Your nullifier hash is: " +
        result.nullifier_hash
    );
  };

  // This function is called when a user has been successfully verified and the proof has been sent to the backend
  const handleProof = async (result: ISuccessResult) => {
    console.log(
      "Proof received from IDKit, sending to backend:\n",
      JSON.stringify(result)
    ); // Log the proof from IDKit to the console for visibility

    // Extract only the nullifier hash from the proof to display to the user
    const formattedResult = `ID: ${result.nullifier_hash}`;
	setProofResult(formattedResult); // Set the proof result in the state for display

	//get the proof from the backend (verify the proof)
    const data = await verify(result);
    if (data.success == true) { //check if the verification was success or not
      console.log("Successful response from backend:\n", JSON.stringify(data)); // Log the response from our backend for visibility
    } 
	else {
      throw new Error(`${data.detail}`); // Throw an error if the verification failed
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center align-middle h-screen">
        <p className="text-2xl mb-5">World ID Cloud Template</p>
        <IDKitWidget
          action={action} //action to use for verification
          app_id={app_id} //app ID to use for verification
          onSuccess={onSuccess} //function to call when a user has been successfully verified
          handleVerify={handleProof} //function to call when a user has been successfully verified and the proof has been sent to the backend
          verification_level={VerificationLevel.Device} // Change this to VerificationLevel.Device to accept Orb- and Device-verified users
        />
        <button
          className="border border-black rounded-md"
          onClick={() => setOpen(true)}
        >
          <div className="mx-3 my-1">Verify with World ID</div>
        </button>
        {proofResult && ( //check if the proofResult is not null and then display the proofResult
          <pre>
            {proofResult}
          </pre>
        )}
      </div>
    </div>
  );
}