import React from 'react';

import useStateParams from '../lib/hooks/useStateParams';
import Welcome from './Welcome';

interface UseFencing {
  fencing: boolean;
}

interface StatusFilter {
  Complete: boolean;
  'In progress': boolean;
  New: boolean;
}

interface SizeFilter {
  Mini: boolean;
  Standard: boolean;
}

function makeStatusFilter(complete: boolean, inProgress: boolean, _new: boolean): StatusFilter {
  return {Complete: complete, 'In progress': inProgress, New: _new};
}

function makeSizeFilter(mini: boolean, standard: boolean): SizeFilter {
  return {Mini: mini, Standard: standard};
}

const WrappedWelcome = (props: UseFencing) => {
  const [includeComplete, setIncludeComplete] = useStateParams(
    true,
    'complete',
    (s) => (s ? '1' : '0'),
    (s) => s === '1'
  );

  const [includeInProgress, setIncludeInProgress] = useStateParams(
    true,
    'in_progress',
    (s) => (s ? '1' : '0'),
    (s) => s === '1'
  );

  const [includeNew, setIncludeNew] = useStateParams(
    true,
    'new',
    (s) => (s ? '1' : '0'),
    (s) => s === '1'
  );

  const [includeMini, setIncludeMini] = useStateParams(
    true,
    'mini',
    (s) => (s ? '1' : '0'),
    (s) => s === '1'
  );

  const [includeStandard, setIncludeStandard] = useStateParams(
    true,
    'standard',
    (s) => (s ? '1' : '0'),
    (s) => s === '1'
  );

  const [search, setSearch] = useStateParams(
    '',
    'search',
    (s) => s,
    (s) => s
  );

  function setStatusFilter(statusFilter: StatusFilter) {
    setIncludeComplete(statusFilter['Complete']);
    setIncludeInProgress(statusFilter['In progress']);
    setIncludeNew(statusFilter['New']);
  }

  function setSizeFilter(sizeFilter: SizeFilter) {
    setIncludeMini(sizeFilter['Mini']);
    setIncludeStandard(sizeFilter['Standard']);
  }

  const welcomeProps = {
    statusFilter: makeStatusFilter(includeComplete, includeInProgress, includeNew),
    setStatusFilter,
    sizeFilter: makeSizeFilter(includeMini, includeStandard),
    setSizeFilter,
    search,
    setSearch,
    fencing: props.fencing,
  };

  return <Welcome {...welcomeProps} />;
};

export default WrappedWelcome;
