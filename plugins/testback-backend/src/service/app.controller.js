/* eslint-disable no-console */
/* eslint-disable @backstage/no-undeclared-imports */
/* eslint-disable spaced-comment */
/* eslint-disable no-restricted-imports */
/*Controller to handle API functionalities*/
import path from "path";
import fs from "fs";
import { promises as fsPromises } from 'fs';

import simpleGit from "simple-git";
import { fileURLToPath } from 'url';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function httpcreateEnvironment(req, res) {

  // Extract data from the frontend request body 
  const environmentName = req.body.environmentName;
  const scenario = req.body.scenario;
  const containerImage = req.body.containerImage;
  //const gitRepoUrl = req.body.gitRepoUrl; 


  // Get the absolute path to the directory containing the current script
  const __filename = fileURLToPath(import.meta.url);
  const __dirna = path.dirname(__filename);
  const scriptDirectory = __dirna;
  // Define the subdirectory name
  const subdirectoryName = 'cloned-repos';
  // Create the full path to the subdirectory
  const subdirectoryPath = path.join(scriptDirectory, subdirectoryName);

  // Check if the subdirectory exists; if not, create it
  if (!fs.existsSync(subdirectoryPath)) {
    await fs.mkdirSync(subdirectoryPath);
  }
   // Generate a unique identifier (UUID)
   const uniqueIdentifier = uuidv4();
  const dirname =environmentName+ uniqueIdentifier;
  const repoDirectory = path.join(subdirectoryPath, dirname);

  // Clone the Git repository
  const git = simpleGit();
  //You can change the test repo here.
  await git.clone("https://github.com/elyk48/TestRepo.git", repoDirectory).then(async () => {
 
    //Create a new Git branch
    const branchName = `env-${environmentName}-${scenario}-${Date.now()}-${uniqueIdentifier}`;
    await git.cwd(repoDirectory).then(async () => {


      await git.checkoutLocalBranch(branchName).then(async () => {


        // make necessary file changes
        const dockerfileContent = `FROM ${containerImage}\nCOPY . /app\nWORKDIR /app`;
        try {
          await fsPromises.writeFile(path.join(repoDirectory, 'Dockerfile'), dockerfileContent, 'utf8');
         
        } catch (error) {
          console.error('Error writing Dockerfile:', error);
        }

        //Commit changes
        await git.add('./*').then(async () => {

          await git.commit(`Update configuration for ${environmentName}`).then(async () => {
            // Push the branch to the remote repository
            await git.push('origin', branchName).then(async () => {

              //sending a pull request
              await axios.post(
                "https://api.github.com/repos/elyk48/TestRepo/pulls",
                {
                  title: `Pull Request for ${environmentName}`,
                  head: branchName,
                  base: 'main',
                  body: 'pull request',
                },
                {
                  headers: {
                    Authorization: `token ${"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"}`,
                    'Content-Type': 'application/json',
                  },
                }
              ).then((response) => {
                // Extract only the relevant data from the response
                const responseData = {
                  status: response.status,
                  data: response.data,
                };
                console.error('Success!!!!!!');
                res.status(200).json(responseData);
              })
                .catch((err) => {
                  console.error('Error creating pull request:', err);
                  console.error('GitHub API response:', err.response.data);

                  // Respond to the frontend with an error message
                  res.status(500).json({ error: `Pull request error ${  err.message}` });
                });

              /*
              const container = await docker.createContainer({
                Image: containerImage,
                // Other container configuration options
              });
              await container.start();*/



            })
              .catch((err) => res.status(500).json({ error: err.message }));


          })
            .catch((err) => res.status(500).json({ error: err.message }));



        })
          .catch((err) => res.status(500).json({ error: err.message }));

      })
        .catch((err) => res.status(500).json({ error: err.message }));

    })
      .catch((err) => res.status(500).json({ error: err.message }));

  })
    .catch((err) => res.status(500).json({ error: err.message }));





}
