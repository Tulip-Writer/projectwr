import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";

const ActionBar = () => {
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();
  const setActivity = appStore((state) => state.setActivity);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      className="border-b border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight text-appLayoutText"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start items-center font-sans"
      >
        <div
          className={`logo h-full w-actionBarLogoSize flex items-center justify-center ml-3 mr-px font-serif pointer-events-none select-none`}
        >
          <span className="icon-[ph--flower-tulip-thin] h-actionBarLogoSize w-actionBarLogoSize"></span>
        </div>

        <div className="flex-grow"></div>

        <ActionButton
          buttonContent={
            <span className="icon-[line-md--question] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
          }
        />

        {deviceType !== "mobile" && (
          <>
            <WindowButton
              className={`ml-1`}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path fill="#fbfafa" d="M20 14H4v-4h16"></path>
                </svg>
              }
              onClick={() => {
                appWindow.minimize();
              }}
            />
            <WindowButton
              className={``}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path fill="#fbfafa" d="M4 4h16v16H4zm2 4v10h12V8z"></path>
                </svg>
              }
              onClick={() => {
                appWindow.toggleMaximize();
              }}
            />
            <WindowButton
              destructive={true}
              className={``}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#fbfafa"
                    d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
                  ></path>
                </svg>
              }
              onClick={() => {
                appWindow.close();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ActionBar;

const ActionButton = ({ onClick, className, buttonContent }) => {
  return (
    <button
      className={`h-full px-4 w-fit ml-1 hover:bg-appLayoutInverseHover flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

const WindowButton = ({
  onClick,
  className,
  buttonContent,
  destructive = false,
}) => {
  return (
    <button
      className={`h-full px-4 w-fit ${
        destructive
          ? "hover:bg-appLayoutDestruct hover:bg-opacity-70"
          : "hover:bg-appLayoutInverseHover"
      } ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};
