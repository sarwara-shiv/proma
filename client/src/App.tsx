import { useTranslation } from "react-i18next";
function App() {
  const {t} = useTranslation("common");
  return (
    <div className="App bg-gray-100">
      <header className="App-header"> 
          {t(`test`)} 
          <div className="btn btn-solid">Solid button</div>
      </header>
    </div>
  );
}

export default App;  
