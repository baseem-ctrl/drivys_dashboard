import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Term {
  heading: string;
  content: string;
}

interface TermsAccordionProps {
  terms: Term[];
}

const TermsAccordion: React.FC<TermsAccordionProps> = ({ terms }) => (
  <Box width="100%" mx="auto" p={2}>
    {terms.map((term, index) => (
      <Accordion key={index}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">{term.heading}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{term.content}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

export default TermsAccordion;
