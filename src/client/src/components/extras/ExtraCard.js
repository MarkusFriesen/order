import React from 'react';
import {Elevation} from '@rmwc/elevation';
import {
  Toolbar,
  ToolbarRow,
  ToolbarSection,
  ToolbarTitle
} from '@rmwc/toolbar';
import {
  List
} from '@rmwc/list';

import {SimpleListItem} from '@rmwc/list';

const ExtraCard = (props) => {
  const {openDialog} = props
  return (
    <Elevation className="main-elevation" z={24} style={{margin: "1rem"}}>
      <Toolbar>
        <ToolbarRow>
          <ToolbarSection alignStart>
            <ToolbarTitle>{props.typeName}</ToolbarTitle>
          </ToolbarSection>
        </ToolbarRow>
      </Toolbar>
      <List twoLine>
        {props.extras.map(d =>
          <SimpleListItem key={d._id}
            onClick={() => openDialog(d)}
            text={d.name}
            secondaryText={`€ ${d.cost.toFixed(2)}`}
            metaIcon="edit" />
        )}
      </List>
    </Elevation>
  )
}

export default ExtraCard