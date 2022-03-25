# Using Cypress to log memory usage 

Cypress is an end-to-end testing tool, where we can simulate user behaviour in a browser.

The purpose of this repo is to be able to log how much memory the browser uses
when loading our 3d models. 

This repo is basically @cognite/reveals repo with cypress installed, and a small test which simulates user navigation,
which causes sectors to be loaded. Cypress logs the memory usage (and some other things, unfortunately) to `logs.txt`

## Usage
1 Put your processed 3d model files in `/examples/public/primitives`

2 Follow Cognite's instructions on how to run the example viewer in the project root's `Readme.md`.

TLDR;
```
cd viewer 
yarn && yarn run build
cd ../examples
yarn && yarn run start
```
This will run the react app on `http://localhost:3000`


3. Open a second terminal and:
````
cd examples
yarn run logmemory  
````
This will log the test results to `logs.txt`
At the end of the file, there is a table labelled:
**cypress:server:util:process_profiler current & mean memory and CPU usage by process group:**

The relevant number is found in the cell **"Chrome"->"maxMemRssMb"** 

Run the test 5-10 times, and calculate the average results from the tests.
Please enter your results in the `memoryLogResults.md` file.  

