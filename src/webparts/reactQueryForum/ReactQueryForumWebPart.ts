import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Dialog } from '@microsoft/sp-dialog'
import { sp } from '@pnp/sp';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'ReactQueryForumWebPartStrings';
import ReactQueryForum from './components/ReactQueryForum';
import { IReactQueryForumProps } from './components/IReactQueryForumProps';
import CustomListGenerator from "../../services/CustomListGenerator";

export interface IReactQueryForumWebPartProps {
  devTools: boolean;
  isFetching: boolean;
  refreshInterval: number
}

export default class ReactQueryForumWebPart extends BaseClientSideWebPart<IReactQueryForumWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit()
      .then(_ => {
        sp.setup({ spfxContext: this.context })
        return this.generateLists();
      })
  }

  private generateLists = (): Promise<void> =>
    CustomListGenerator.generateLists()
      .then(() => Promise.resolve())
      .catch(error => {
        Dialog.alert(error.message)
        return Promise.reject(error.message)
      })

  public render(): void {
    const element: React.ReactElement<IReactQueryForumProps> = React.createElement(
      ReactQueryForum,
      {
        devTools: this.properties.devTools,
        isFetching: this.properties.isFetching,
        refreshInterval: this.properties.refreshInterval
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle("devTools", {
                  label: strings.DevTools,
                  checked: false,
                  onText: strings.Visible,
                  offText: strings.Hidden,
                }),
                PropertyPaneToggle("isFetching", {
                  label: strings.IsFetching,
                  checked: false,
                  onText: strings.FetchingEnabled,
                  offText: strings.FetchingDisabled,
                }),
                PropertyPaneTextField("refreshInterval", {
                  label: strings.RefreshInterval,
                  description: strings.RefreshIntervalInSec,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
