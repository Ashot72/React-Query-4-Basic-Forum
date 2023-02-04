import * as React from 'react';
import { QueryClient } from "@tanstack/react-query";
import { Dialog } from '@microsoft/sp-dialog'
import * as strings from 'ReactQueryForumWebPartStrings';

function queryErrorHandler(error: unknown) {
    const title = error instanceof Error ? error.message : strings.Error;
    Dialog.alert(title);
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: queryErrorHandler,
            refetchOnWindowFocus: false
        },
        mutations: {
            onError: queryErrorHandler
        }
    }
})

