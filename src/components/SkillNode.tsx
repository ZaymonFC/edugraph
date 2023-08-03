import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Handle, Position } from "reactflow";
import { Subject, throttleTime } from "rxjs";
import { styled } from "../Stitches";
import { explanationsAtom, useAppDispatch } from "../lib/Db";
import { Button } from "./BasicButton";
import { Explanation } from "./Explanation";
import ReactMarkdown from "react-markdown";

export const ExplanationButton = styled("button", {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "100%",
  height: 20,
  width: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",

  padding: 0,
  margin: 0,
  border: "none",
  boxShadow: "none",

  backgroundColor: "$background",
  color: "rgb(241, 200, 146)",

  "&:hover": {
    color: "rgb(255, 222, 179)",
    transform: "scale(1.1)",
  },

  // "&:focus": { boxShadow: `0 0 0 2px ${violet.violet7}` },
});

const NodeContainer = styled("div", {
  position: "relative",

  maxWidth: "180px",

  margin: 0,
  marginTop: -4,
  marginBottom: -1,

  paddingBlock: "$2",
  paddingInline: "$3",

  textAlign: "center",

  border: "1px solid rgb(241, 200, 146)",
  boxShadow: "0px 3px 1px 0px rgb(241, 200, 146)",

  fontFamily: "Jetbrains Mono",
  fontSize: "$1",

  borderRadius: "$2",

  transition: "all 0.1s ease-in-out",

  backdropFilter: "blur(4px)",

  "&:hover": {
    border: "1px solid rgb(255, 222, 179)",
    boxShadow: "0px 3.5px 1px 0px rgb(241, 200, 146)",
    transform: "translate(0, -1px)",
  },
});

const ButtonStack = styled("div", {
  position: "absolute",

  top: -40,

  display: "flex",
  flexDirection: "row",

  alignItems: "center",

  gap: "$4",
});

// Hook that immediately updates the state and then throttles any further updates
const useThrottledState = (initialValue: boolean, delay: number) => {
  const [value, setValue] = useState(initialValue);
  const [throttledValue, setThrottledValue] = useState(initialValue);

  const s$ = useMemo(() => new Subject<boolean>(), []);

  useEffect(() => s$.next(value), [value, s$]);

  useEffect(() => {
    const sub = s$
      .pipe(throttleTime(delay, undefined, { leading: true, trailing: true }))
      .subscribe((v) => {
        setThrottledValue(v);
      });

    return () => sub.unsubscribe();
  }, [s$, delay]);

  return [throttledValue, setValue] as const;
};

const HideShow = styled("div", {
  opacity: 0,
  transition: "all 0.1s ease-in-out",
  variants: { show: { true: { opacity: 1 }, false: { opacity: 0 } } },
});

const ButtonPlacer = styled("div", {
  position: "absolute",
  top: -12,
  right: -2,

  width: 25,
  height: 20,
});

const StyledMarkDown = styled(ReactMarkdown, {
  color: "black",

  "*": {
    paddingBlock: "$2",
  },
});

export const SkillNode = ({ data, ...other }: any) => {
  // console.log(data, other);

  const skill = data.label as string;
  const explanations = useAtomValue(explanationsAtom);
  const explanation = explanations && explanations[skill];

  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useThrottledState(false, 300);

  const explainSkill = () => {
    dispatch({ type: "explain-skill", skill: skill });
  };

  return (
    <div
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <HideShow show={isHovered}>
        <ButtonStack>
          {!explanation && (
            <Button size="xs" onClick={explainSkill}>
              Explain
            </Button>
          )}
          <Button size="xs">Explode</Button>
        </ButtonStack>
      </HideShow>
      <Handle style={{ opacity: 0 }} type="target" position={Position.Top} />
      <NodeContainer>
        {explanation && (
          <ButtonPlacer>
            <Explanation
              trigger={
                <ExplanationButton>
                  <InfoCircledIcon width={20} height={20} />
                </ExplanationButton>
              }
            >
              <StyledMarkDown>{explanation}</StyledMarkDown>
            </Explanation>
          </ButtonPlacer>
        )}
        {skill}
      </NodeContainer>
      <Handle style={{ opacity: 0 }} type="source" position={Position.Bottom} />
    </div>
  );
};
