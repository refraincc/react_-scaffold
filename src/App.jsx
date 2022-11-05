import React, { lazy, Suspense } from 'react';
import { Link, Routes, Route } from "react-router-dom";

import { Button } from "antd";

// import About from "./pages/About";
// import Home from "./pages/Home";

const Home = lazy(() => import("./pages/Home"))
const About = lazy(() => import("./pages/About"))

const App = () => {
    return (
        <div>
            App
            <Button type="primary">Button</Button>
            <ul>
                <li>
                    <Link to='/home' >Home</Link>
                </li>
                <li>
                    <Link to='/about' >About</Link>
                </li>
            </ul>
            <Suspense fallback={ <div>loading...</div>}>
                <Routes>
                    <Route path='/home' element={<Home></Home>}></Route>
                    <Route path='/about' element={<About></About>}></Route>
                </Routes>
            </Suspense>

        </div>
    );
}

export default App;
