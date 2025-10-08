import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Root} from "react-dom/client";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Provider } from "mobx-react";
import chatStore from "./chatStore";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<div>
        <Provider chatStore={chatStore}>
            <App />
        </Provider>
     <ToastContainer />
</div>
);


reportWebVitals();
