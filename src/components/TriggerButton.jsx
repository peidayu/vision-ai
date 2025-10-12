import React from "react";
import * as LucideIconComp from "lucide-react";
import clsx from "clsx";

function LucideIcon(props) {
  const { name, ...rest } = props;
  const Comp = LucideIconComp[name] || LucideIconComp.RectangleVertical;
  return <Comp name={name} {...rest} />;
}

export default function TriggerButton({
  style = {},
  textStyle = {},
  isLoading = false,
  iconName = "ArrowRight", // lucide-react icon name 比如 ChefHat, Settings
  loadingIconName = "loader", // lucide-react icon name 比如 ChefHat, Settings
  iconPosition = "right", // left, right
  iconColor = "white",
  iconSize = 18,
  text = "开始",
  loadingText = "处理中",
}) {
  return (
    <div style={style} className="flex items-center justify-center">
      {iconName && iconPosition === "left" && (
        <LucideIcon
          name={isLoading ? loadingIconName : iconName}
          className={clsx("m-[2px]", {
            "animate-spin": isLoading,
          })}
          size={iconSize}
          color={iconColor}
        />
      )}
      <span style={textStyle}>{isLoading ? loadingText : text}</span>
      {iconName && iconPosition === "right" && (
        <LucideIcon
          name={isLoading ? loadingIconName : iconName}
          className={clsx("m-[2px]", {
            "animate-spin": isLoading,
          })}
          size={iconSize}
          color={iconColor}
        />
      )}
    </div>
  );
}
