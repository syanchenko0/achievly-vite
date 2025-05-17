import { useEffect, useState } from "react";
import { type TeamDto, useGetTeamJoinLink } from "@/shared/api";

const useCopyLink = (team: TeamDto) => {
  const [startCopied, setStartCopied] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: jointTeamLink, isLoading: jointTeamLinkLoading } =
    useGetTeamJoinLink(
      { id: String(team.id) },
      { query: { enabled: startCopied } },
    );

  const handleCopyLink: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    setStartCopied(true);
    if (jointTeamLink) {
      navigator.clipboard.writeText(
        `${window.location.origin}${jointTeamLink}`,
      );
      setCopied(true);
      setStartCopied(false);
    }
  };

  const handleResetCopied = () => {
    setCopied(false);
  };

  useEffect(() => {
    if (jointTeamLink) {
      navigator.clipboard.writeText(
        `${window.location.origin}${jointTeamLink}`,
      );
      setCopied(true);
      setStartCopied(false);
    }
  }, [jointTeamLink]);

  return {
    handleCopyLink,
    handleResetCopied,
    copied,
    copyLoading: jointTeamLinkLoading,
  };
};

export { useCopyLink };
