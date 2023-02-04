import * as React from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from "@tanstack/react-query";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as strings from 'ReactQueryForumWebPartStrings';
import { IReactQueryForumProps } from './IReactQueryForumProps';
import Loading from './Loading';
import { queryClient } from '../queryClient';
import Forums from './Forums/Forums';

const Topics = React.lazy(() => import('./Topics/Topics'))
const Posts = React.lazy(() => import('./Posts/Posts'))

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
)

const ReactQueryForum: React.FC<IReactQueryForumProps> = ({ devTools, isFetching, refreshInterval }) =>
  <QueryClientProvider client={queryClient} >
    <Loading shouldFetch={isFetching} />
    <ReactQueryDevtools initialIsOpen={false} position='bottom-right' />
    <React.Suspense fallback={<Spinner size={SpinnerSize.large} label={strings.LoadingCompnent} />}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Forums refreshInterval={refreshInterval} />
          </Route>
          <Route path="/topics/:fid" component={Topics} />
          <Route path="/posts/:fid/:tid" component={Posts} />
          <Route path="*" component={Forums} />
        </Switch>
      </Router>
      {devTools && <ReactQueryDevtoolsProduction />}
    </React.Suspense>
  </QueryClientProvider>

export default ReactQueryForum
