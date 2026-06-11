import { useState, useEffect } from "react";
import { ExportFunctions, SceneOptions, initializeScene } from "./utils/scene";
import { PlanetFeatures, generatePlanetFeatures } from "./utils/planet-features";
import { InfoRow } from "./components/info-row";
import { Separator } from "./components/separator";
import { StyledButton } from "./components/styled-button";

function App() {
    const CAMERA_VIEWS = {
        DEFAULT: "Horizon View",
        CLOSEUP: "Standard View",
    };
    const [planetInfo, setPlanetInfo] = useState(null);
    const [planetFeatures, setPlanetFeatures] = useState<null | PlanetFeatures>(null);
    const [sceneFunctions, setSceneFunctions] = useState<null | ExportFunctions>(null);
    const [cameraView, setCameraView] = useState(CAMERA_VIEWS.DEFAULT);
    const [buttonsLoading, setbuttonsLoading] = useState(true);

    const toggleCameraView = () => {
        setbuttonsLoading(true);
        const callback = () => {
            setbuttonsLoading(false);
        };
        cameraView === CAMERA_VIEWS.DEFAULT
            ? sceneFunctions?.moveCameraCloseup(callback)
            : sceneFunctions?.moveCameraDefault(callback);
        setCameraView(cameraView === CAMERA_VIEWS.DEFAULT ? CAMERA_VIEWS.CLOSEUP : CAMERA_VIEWS.DEFAULT);
    };

    const doNextPlanet = () => {
        setbuttonsLoading(true);
        const callback = () => {
            setbuttonsLoading(false);
        };

        if (cameraView !== CAMERA_VIEWS.DEFAULT) {
            sceneFunctions?.moveCameraDefault();
            setCameraView(CAMERA_VIEWS.DEFAULT);
        }
        sceneFunctions?.generateNewPlanet(callback);
    };

    useEffect(() => {
        const canvas = document.getElementById("myThreeJsCanvas");
        if (canvas) {
            const params = new URLSearchParams(window.location.search);
            const options: SceneOptions = {
                exportMode: params.get('export') === '1',
                planetType: params.get('type')?.toUpperCase() || undefined,
                size: params.get('size') ? parseInt(params.get('size')!) : undefined,
            };
            const initializedCameraFunctions = initializeScene(
                canvas,
                setPlanetInfo,
                () => setbuttonsLoading(false),
                options
            );
            setSceneFunctions(initializedCameraFunctions);
        }
    }, []);

    useEffect(() => {
        if (planetInfo) {
            const features = generatePlanetFeatures(planetInfo);
            setPlanetFeatures(features);
        }
    }, [planetInfo]);

    return (
        <div>
            <div className="bg-black h-screen opacity-60 absolute right-0 w-1/5"></div>
            <div className="right-0 absolute h-screen w-1/5 p-8 ">
                <div className="text-white text-3xl font-bold">{planetFeatures?.name}</div>

                <Separator />

                <InfoRow label="TYPE" value={planetFeatures?.type} />
                <InfoRow label="LENGTH OF DAY" value={planetFeatures?.rotationalPeriod} />
                <InfoRow label="LENGTH OF YEAR" value={planetFeatures?.orbitalPeriod} />
                <InfoRow label="DIAMETER" value={planetFeatures?.diameter} />

                <Separator />

                <InfoRow label="POPULATION" value={planetFeatures?.population} />
                <InfoRow label="GDP" value={planetFeatures?.gdp} />
                <InfoRow label="PRIMARY EXPORTS" value={planetFeatures?.exports} />
                <InfoRow label="Established" value={planetFeatures?.established} />

                <Separator />

                <StyledButton onClick={toggleCameraView} isDisabled={buttonsLoading} text={cameraView} />
                <StyledButton onClick={doNextPlanet} isDisabled={buttonsLoading} text="Next Planet" />
            </div>
            <div className=" z-10 right-0 bottom-0 absolute p-8 text-xs text-white">
                Built with 🤍 by <a className='underline' href="https://github.com/eashba" target="_blank" rel="noopener noreferrer">Evan</a>
            </div>

            <canvas id="myThreeJsCanvas"></canvas>
        </div>
    );
}

export default App;
