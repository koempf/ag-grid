import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";
function actionCellRenderer(params) {
  let eGui = document.createElement("div");

  let editingCells = params.api.getEditingCells();
  // checks if the rowIndex matches in at least one of the editing cells
  let isCurrentRowEditing = editingCells.some((cell) => {
    return cell.rowIndex === params.node.rowIndex;
  });

  if (isCurrentRowEditing) {
    eGui.innerHTML = `
<button  class="action-button update"  data-action="update"> update  </button>
<button  class="action-button cancel"  data-action="cancel" > cancel </button>
`;
  } else {
    eGui.innerHTML = `
<button class="action-button edit"  data-action="edit" > edit  </button>
<button class="action-button delete" data-action="delete" > delete </button>
`;
  }

  return eGui;
}

@Component({
  selector: "my-app",
  template: `<ag-grid-angular
    #agGrid
    style="width: 100%; height: 600px;"
    id="myGrid"
    class="ag-theme-alpine"
    [modules]="modules"
    [columnDefs]="columnDefs"
    [defaultColDef]="defaultColDef"
    [enableRangeSelection]="true"
    [rowData]="rowData"
    (gridReady)="onGridReady($event)"
    (rowEditingStopped)="onRowEditingStopped($event)"
    (rowEditingStarted)="onRowEditingStarted($event)"
    (cellClicked)="onCellClicked($event)"
    editType="fullRow"
    [suppressClickEdit]="true"
  ></ag-grid-angular>`
})
export class AppComponent {
  private gridApi;
  private gridColumnApi;

  public modules: Module[] = [ClientSideRowModelModule, RangeSelectionModule];
  private columnDefs;
  private defaultColDef;
  private rowData: [];

  constructor(private http: HttpClient) {
    this.columnDefs = [
      { field: "athlete", minWidth: 150 },
      { field: "age", maxWidth: 90 },
      {
        headerName: "action",
        minWidth: 150,
        cellRenderer: actionCellRenderer,
        editable: false,
        colId: "action"
      }
    ];
    this.defaultColDef = {
      editable: true
    };
    this.rowData = null;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.http.get("https://www.ag-grid.com/example-assets/olympic-winners.json").subscribe((data) => {
      this.rowData = data;
    });
  }

  onCellClicked(params) {
    // Handle click event for action cells
    if (params.column.colId === "action" && params.event.target.dataset.action) {
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: params.columnApi.getDisplayedCenterColumns()[0].colId
        });
      }

      if (action === "delete") {
        params.api.applyTransaction({
          remove: [params.node.data]
        });
      }

      if (action === "update") {
        params.api.stopEditing(false);
      }

      if (action === "cancel") {
        params.api.stopEditing(true);
      }
    }
  }

  onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true
    });
  }
  onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true
    });
  }
}
