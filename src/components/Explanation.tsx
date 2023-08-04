import { violet } from "@radix-ui/colors";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { keyframes, styled } from "@stitches/react";

export const Explanation = ({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Popover.Root>
    <Popover.Trigger asChild>{trigger}</Popover.Trigger>
    <Popover.Portal>
      <PopoverContent sideOffset={5}>
        <Flex css={{ flexDirection: "column", gap: 10 }}>{children}</Flex>
        <PopoverClose aria-label="Close">
          <Cross2Icon />
        </PopoverClose>
        <PopoverArrow />
      </PopoverContent>
    </Popover.Portal>
  </Popover.Root>
);

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const PopoverContent = styled(Popover.Content, {
  borderRadius: 4,
  padding: "$7",
  width: "70vh",
  maxHeight: "50vh",

  p: {
    fontFamily: "Georgia, serif",
  },

  "h1, h2, h3": {
    fontFamily: "EB Garamond, serif",
    marginBlock: 10,
  },

  margin: "$5",

  overflow: "scroll",

  backgroundColor: "white",

  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",

  animationDuration: "400ms",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",

  willChange: "transform, opacity",
  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },

  "&:focus": {
    boxShadow: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px, 0 0 0 2px ${violet.violet7}`,
  },
});

const PopoverArrow = styled(Popover.Arrow, {
  fill: "white",
});

const PopoverClose = styled(Popover.Close, {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "100%",
  height: 25,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: violet.violet11,
  position: "absolute",
  top: 5,
  right: 5,

  "&:hover": { backgroundColor: violet.violet4 },
  "&:focus": { boxShadow: `0 0 0 2px ${violet.violet7}` },
});

const Flex = styled("div", { display: "flex" });
