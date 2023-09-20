/* eslint-disable no-console */
/* eslint-disable @backstage/no-undeclared-imports */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import './Home.css';
// eslint-disable-next-line @backstage/no-undeclared-imports
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from 'react-loading'; 

function Home() {
  const [environmentName, setEnvironmentName] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [selectedContainerImage, setSelectedContainerImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEnvironmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnvironmentName(e.target.value);
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScenario(e.target.value);
  };

  const handleContainerImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContainerImage(e.target.value);
  };

  const handleSubmit = () => {
    const requestData = {
      environmentName:environmentName,
      scenario: selectedScenario,
      containerImage: selectedContainerImage,
    };
    setIsLoading(true);
    axios.post('http://localhost:7007/api/testback/createEnv', requestData)
      .then((response) => {
        console.log(response);
        // Handle success, e.g., show a success message as a toast notification
        toast.success('Request submitted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Auto-close the notification after 3 seconds
        });
      })
      .catch((error) => {
       
        // Handle error, e.g., show an error message as a toast notification
        toast.error(`Error: ${error}`, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: false, // Do not auto-close the error notification
        });
      }).finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="container">
      <h1>On demand environment</h1>

      <div>
        <label>Environment Name:</label>
        <input
          type="text"
          value={environmentName}
          onChange={handleEnvironmentNameChange}
          className="input-field"
        />
      </div>

      <div>
        <label>Scenario:</label>
        <select value={selectedScenario} onChange={handleScenarioChange} className="dropdown">
          <option value="k8s_rbac">Kubernetes RBAC</option>
          <option value="dockerfile">Dockerfile</option>
       
        </select>
      </div>

      <div>
        <label>Container Image:</label>
        <select
          value={selectedContainerImage}
          onChange={handleContainerImageChange}
          className="dropdown"
        >
          <option value="image1">Image 1</option>
          <option value="image2">Image 2</option>
          
        </select>
      </div>
      {isLoading ? (
        <div className="loading-bar">
          <ReactLoading type="bars" color="#41e4b6" height={100} width={100} />
          <p>Loading...</p>
        </div>
      ) : (
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
      )}
      <ToastContainer />
    </div>
  );
}

export default Home;