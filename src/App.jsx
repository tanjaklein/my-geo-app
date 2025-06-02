import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { MapView } from '@aws-amplify/ui-react-geo';
import '@aws-amplify/ui-react/styles.css';

import '@aws-amplify/ui-react-geo/styles.css';
import * as React from 'react';
import { Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


//import awsExports from './aws-exports.json';



function App() {
  Amplify.configure(outputs);
 // Amplify.configure(awsExports);
  

  return (
    <Button variation="primary">Hello world</Button>
  )
}

export default App
