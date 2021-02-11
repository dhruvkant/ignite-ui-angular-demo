import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Injector,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import {
  IGridCreatedEventArgs,
  IgxColumnComponent,
  IgxHierarchicalGridAPIService,
  IgxHierarchicalGridComponent,
  IgxRowIslandComponent
} from "igniteui-angular";
import { IDataState, RemoteLoDService } from "../services/remote-lod.service";
import { CustomRow } from "./custom-row";

@Component({
  providers: [RemoteLoDService],
  selector: "app-hierarchical-grid-lod",
  styleUrls: ["./hierarchical-grid-lod.component.scss"],
  templateUrl: "./hierarchical-grid-lod.component.html"
})
export class HierarchicalGridLoDSampleComponent implements AfterViewInit {
  @ViewChild("hGrid", { static: true })
  public hGrid: IgxHierarchicalGridComponent;


  @ViewChild("hGrid", { static: true, read: ViewContainerRef })
  private grid1ViewRef: ViewContainerRef;

  public rowIslandEvent: IGridCreatedEventArgs;

  constructor(
    private remoteService: RemoteLoDService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  public ngAfterViewInit() {
    const dataState: IDataState = {
      key: "Customers",
      parentID: "",
      parentKey: "",
      rootLevel: true
    };
    this.hGrid.isLoading = true;
    this.remoteService.getData(dataState).subscribe(
      data => {
        this.hGrid.isLoading = false;
        this.hGrid.data = data;
        this.hGrid.cdr.detectChanges();
      },
      error => {
        this.hGrid.emptyGridMessage = error.message;
        this.hGrid.isLoading = false;
        this.hGrid.cdr.detectChanges();
      }
    );
  }

  public dateFormatter(val: string) {
    return new Intl.DateTimeFormat("en-US").format(new Date(val));
  }

  public gridCreated(event: IGridCreatedEventArgs, _parentKey: string) {
    const dataState = {
      key: event.owner.key,
      parentID: event.parentID,
      parentKey: _parentKey,
      rootLevel: false
    };

    event.grid.isLoading = true;
    this.remoteService.getData(dataState).subscribe(data => {
      event.grid.isLoading = false;
      event.grid.data = data;
      event.grid.cdr.detectChanges();
      this.rowIslandEvent = event;
    });
  }

  addRowIsland() {
    const cmp = this.cfr.resolveComponentFactory(IgxRowIslandComponent);
    const inst = this.grid1ViewRef.createComponent(cmp);
    inst.instance.key = "Order_detail";
    inst.instance.primaryKey = "ProductID";
    inst.instance.autoGenerate = true;
    this.rowIslandEvent.grid.hasChildrenKey = "ProductID";
    this.rowIslandEvent.grid.cdr.markForCheck();
    this.rowIslandEvent.grid.cdr.detectChanges();
    this.rowIslandEvent.grid.hgridAPI.grid.cdr.markForCheck();
    this.rowIslandEvent.grid.hgridAPI.grid.cdr.detectChanges();

    console.log(this.hGrid);
    // console.log(this.rowIslandEvent.grid.hgridAPI.getChildGrids());
    // console.log(this.rowIslandEvent);
  }
}
