import { createContext, useState, useContext, useEffect } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  // 👉 ouvre par défaut si largeur >= 768px (exemple breakpoint tablette/desktop)
  const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 768);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // 👉 écoute les changements de taille pour adapter automatiquement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true); // ouvert sur grand écran
      } else {
        setMenuOpen(false); // fermé sur petit écran
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <MenuContext.Provider value={{ menuOpen, toggleMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
