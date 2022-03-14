import Home from './components/Home';
import HomeMobile from './components/HomeMobile';

export default function App() {
    if (window.matchMedia("(min-width: 560px)").matches) {
        return (
            <Home />
        );
    } else {
        return (
            <HomeMobile />
        );
    };
};
