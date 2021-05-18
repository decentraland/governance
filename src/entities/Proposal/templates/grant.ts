import { NewProposalGrant } from "../types";
import { formatBalance, formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalGrant) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalGrant) => template`
Should the following ${proposal.tier} grant in the ${proposal.category} category be approved?

## Abstract

${formatMarkdown(proposal.abstract)}

## Grant size

${formatBalance(proposal.size)} MANA

## Description

${formatMarkdown(proposal.description)}

## Specification

${formatMarkdown(proposal.specification)}

## Personnel

${formatMarkdown(proposal.personnel)}

## Roadmap and milestones

${formatMarkdown(proposal.roadmap)}

`
