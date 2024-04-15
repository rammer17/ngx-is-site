import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { DataTableComponent } from '../components/data-table/data-table.component';
import { InputComponent } from '../components/input/input.component';
import { ModalComponent } from '../components/modal/modal.component';
import { PopoverDirective } from '../components/popover/popover.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SelectComponent } from '../components/select/select.component';
import { SwitchComponent } from '../components/switch/switch.component';
import { TableComponent } from '../components/table/table.component';
import { TooltipDirective } from '../components/tooltip/tooltip.directive';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    ButtonComponent,
    DataTableComponent,
    InputComponent,
    ModalComponent,
    PopoverDirective,
    FontAwesomeModule,
    SelectComponent,
    SwitchComponent,
    TableComponent,
    TooltipDirective,
  ],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss',
})
export class DocumentationComponent {
  gettingStarted = [
    {
      label: 'Introduction',
    },
    {
      label: 'Installation',
    },
  ];

  components = [
    {
      label: 'Button',
      available: true,
    },
    {
      label: 'Data table',
      available: true,
    },
    {
      label: 'Context menu',
      available: false,
    },
    {
      label: 'Input',
      available: true,
    },
    {
      label: 'Modal',
      available: true,
    },
    {
      label: 'Popover',
      available: true,
    },
    {
      label: 'Select',
      available: true,
    },
    {
      label: 'Switch',
      available: true,
    },
    {
      label: 'Table',
      available: true,
    },
    {
      label: 'Toast',
      available: false,
    },
    {
      label: 'Tooltip',
      available: true,
    },
  ];
  data = [
    {
      task: 'TASK-1',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-2',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-3',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'B',
    },
    {
      task: 'TASK-4',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'C',
    },
    {
      task: 'TASK-5',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-6',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'D',
    },
    {
      task: 'TASK-7',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-8',
      title: 'We need to bypass the neural TCP card!',
      status: 'AB',
    },
    {
      task: 'TASK-9',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'Y',
    },
    {
      task: 'TASK-10',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-11',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-12',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'B',
    },
    {
      task: 'TASK-13',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'C',
    },
    {
      task: 'TASK-14',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-15',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'D',
    },
    {
      task: 'TASK-16',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-17',
      title: 'We need to bypass the neural TCP card!',
      status: 'AB',
    },
    {
      task: 'TASK-18',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'Y',
    },
    {
      task: 'TASK-19',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-20',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-21',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'B',
    },
    {
      task: 'TASK-22',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'C',
    },
    {
      task: 'TASK-23',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-24',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'D',
    },
    {
      task: 'TASK-25',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-26',
      title: 'We need to bypass the neural TCP card!',
      status: 'AB',
    },
    {
      task: 'TASK-27',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'Y',
    },
  ];
  data2 = [
    {
      task: 'TASK-1',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-2',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-3',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'B',
    },
    {
      task: 'TASK-4',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'C',
    },
    {
      task: 'TASK-5',
      title: 'We need to bypass the neural TCP card!',
      status: 'A',
    },
    {
      task: 'TASK-6',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'D',
    },
    {
      task: 'TASK-7',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
    {
      task: 'TASK-8',
      title: 'We need to bypass the neural TCP card!',
      status: 'AB',
    },
    {
      task: 'TASK-9',
      title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: 'Y',
    },
    {
      task: 'TASK-10',
      title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
      status: 'B',
    },
  ];
  options = ['Rick', 'John', 'Carter', 'Michael', 'Sydney'];

  showModal = false;
  showPopover = false;

  selectedComponent: any = {
    label: 'Introduction',
  };

  onSelectComponent(component: any): void {
    console.log(component);
    this.selectedComponent = component;
  }
}
