import Sidebar from "./Sidebar";
import Header from "./Header";

function LayoutInterno({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default LayoutInterno;
