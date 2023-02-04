import * as React from 'react'
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import * as strings from 'ReactQueryForumWebPartStrings';

interface ILoading {
    shouldFetch: boolean;
}

const Loading: React.FC<ILoading> = ({ shouldFetch }) => {
    const isFetching = useIsFetching();
    const isMutating = useIsMutating();

    const display = (shouldFetch && isFetching) || isMutating ? 'inherit' : 'none';

    return (
        <div style={{ display, top: "50%", left: '50%', padding: "5px" }}>
            <Spinner
                size={SpinnerSize.large}
                label={isFetching ? strings.Fetching : strings.Sending} />
        </div>
    )
}

export default Loading