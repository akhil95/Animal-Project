# Animal Data Processing

This project processes animal data using AWS services including Lambda, DynamoDB, and S3.

## Features

- Retrieve a summary of animal classes.
- Filter animals by specific traits and class type or class number.
- Process data from S3 to DynamoDB.

## Prerequisites

- AWS CLI configured with appropriate permissions.
- Node.js installed.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.

## Usage

### Deploying with Serverless Framework

```bash
serverless deploy
```

## Project Structure

animalProject/
├── .git/
├── coverage/
├── src/
│ ├── cache/
│ │ ├── cache.js
│ ├── services/
│ │ ├── getAnimalByTrait.js
│ │ ├── getAnimalClassSummary.js
│ │ ├── handler.js
│ ├── specs/
│ │ ├── cache.spec.js
│ │ ├── getAnimalByTrait.spec.js
│ │ ├── getAnimalClassSummary.spec.js
│ │ ├── handler.spec.js
│ │ ├── index.spec.js
│ ├── index.js
└── package.json

## Running Tests

- To execute all unit tests:
- npm test
- This will run tests located in the src/specs/ directory, outputting results to the console.

## Code Coverage

- To generate a code coverage report:
- npm run coverage
- This generates a detailed report in the coverage/lcov-report directory. Open index.html in a browser to view the report.

## Contributing

- Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.

2. Create a new branch:

- git checkout -b feature-branch

3. Make your changes and commit them:

- git commit -m "Description of changes"

4. Push to the branch:

- git push origin feature-branch

5. Open a pull request.

## License

- This project is licensed under the MIT License. See the LICENSE file for details.
