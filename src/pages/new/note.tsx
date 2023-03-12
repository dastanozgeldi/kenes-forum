import { UploadNote } from "components/common/UploadNote";
import { useState, useEffect } from "react";

const NewNote = () => {
  const [Comp, setComp] = useState<any>(null);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((comp) => {
      setComp(comp.Excalidraw as any);
    });
  }, []);

  return (
    <div className="flex items-start gap-3">
      {Comp && (
        <div className="w-full h-[95vh]">
          <Comp />
        </div>
      )}
      <UploadNote />
    </div>
  );
};

export default NewNote;
