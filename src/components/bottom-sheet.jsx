import { useEffect, useRef } from "react";

const BottomSheet = ({ onClose, children }) => {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  // Lock scroll + slide in on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;

    // Start off-screen
    sheet.style.transform = "translateY(100%)";
    sheet.style.transition = "none";
    backdrop.style.opacity = "0";

    // Two rAF to ensure initial styles are painted first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheet.style.transition =
          "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)";
        sheet.style.transform = "translateY(0)";
        backdrop.style.transition = "opacity 0.35s ease";
        backdrop.style.opacity = "1";
      });
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const animateClose = () => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) {
      sheet.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 1, 1)";
      sheet.style.transform = "translateY(100%)";
    }
    if (backdrop) {
      backdrop.style.transition = "opacity 0.28s ease";
      backdrop.style.opacity = "0";
    }
    setTimeout(onClose, 290);
  };

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    if (!draggingRef.current) return;
    const delta = Math.max(0, e.touches[0].clientY - startYRef.current);
    if (sheetRef.current)
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    if (backdropRef.current)
      backdropRef.current.style.opacity = String(
        Math.max(0, 1 - delta / 350),
      );
  };

  const handleTouchEnd = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const delta = Math.max(
      0,
      e.changedTouches[0].clientY - startYRef.current,
    );
    if (delta > 110) {
      animateClose();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transition =
          "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";
        sheetRef.current.style.transform = "translateY(0)";
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 0.3s ease";
        backdropRef.current.style.opacity = "1";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/55"
        style={{ opacity: 0 }}
        onClick={animateClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-card rounded-t-2xl flex flex-col shadow-2xl border-t border-border"
        style={{ height: "80vh" }}
      >
        {/* Drag handle strip — touch target for swipe-to-close */}
        <div
          className="flex justify-center pt-3 pb-2 shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
